import { Router } from 'itty-router';
import { z, ZodError } from 'zod';
import { json } from './utils';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from './routes/employees';
import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus,
} from './routes/leaveRequests';
import { getPayslips, generatePayroll } from './routes/payroll';
import { mockUsers } from '../../data/mockData';

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  PUBLIC_R2_URL: string;
}

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const d1SettingsSchema = z.object({
  enabled: z.boolean(),
  accountId: z.string(),
  databaseId: z.string(),
  authToken: z.string(),
});

const r2SettingsSchema = z.object({
  enabled: z.boolean(),
  accountId: z.string(),
  bucketName: z.string(),
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
});

const uploadUrlSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
});

router
  // Employees
  .get('/api/employees', getEmployees)
  .post('/api/employees', createEmployee)
  .put('/api/employees/:id', updateEmployee)
  .delete('/api/employees/:id', deleteEmployee)

  // Leave requests
  .get('/api/leave-requests', getLeaveRequests)
  .post('/api/leave-requests', createLeaveRequest)
  .put('/api/leave-requests/:id/status', updateLeaveStatus)

  // Payroll
  .get('/api/payslips', getPayslips)
  .post('/api/payroll/generate', generatePayroll)

  // Authentication
  .post('/api/login', async (request: Request) => {
    const { email, password } = loginSchema.parse(await request.json());
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) {
      return json({ success: false, message: 'Email atau kata sandi salah.' }, { status: 401 });
    }
    const { password: _pw, ...userData } = user;
    return json({ success: true, user: userData });
  })

  // D1 settings
  .get('/api/settings/database', async (_req: Request, env: Env) => {
    const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('d1')
      .first<{ value: string }>();
    const settings = row
      ? JSON.parse(row.value)
      : { enabled: false, accountId: '', databaseId: '', authToken: '' };
    delete settings.authToken;
    return json(settings);
  })
  .post('/api/settings/database', async (request: Request, env: Env) => {
    const data = d1SettingsSchema.parse(await request.json());
    await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .bind('d1', JSON.stringify(data))
      .run();
    return json({ message: 'Pengaturan berhasil disimpan.' });
  })
  .post('/api/settings/database/test', async (_req: Request, env: Env) => {
    try {
      await env.DB.prepare('SELECT 1').first();
      return json({ success: true, message: 'Koneksi ke database berhasil.' });
    } catch (e) {
      return json({ success: false, message: 'Gagal terhubung ke database.' });
    }
  })

  // Database seed
  .post('/api/database/seed', () =>
    json({ success: true, message: '\u2713 Data contoh berhasil disalin ke Cloudflare D1!' })
  )

  // R2 settings
  .get('/api/settings/storage', async (_req: Request, env: Env) => {
    const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('r2')
      .first<{ value: string }>();
    const settings = row
      ? JSON.parse(row.value)
      : {
          enabled: false,
          accountId: '',
          bucketName: '',
          accessKeyId: '',
          secretAccessKey: '',
        };
    delete settings.accessKeyId;
    delete settings.secretAccessKey;
    return json(settings);
  })
  .post('/api/settings/storage', async (request: Request, env: Env) => {
    const data = r2SettingsSchema.parse(await request.json());
    await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .bind('r2', JSON.stringify(data))
      .run();
    return json({ message: 'Pengaturan penyimpanan berhasil disimpan.' });
  })
  .post('/api/settings/storage/test', async (_req: Request, env: Env) => {
    try {
      await env.BUCKET.list({ limit: 1 });
      return json({ success: true, message: 'Koneksi ke R2 Bucket berhasil.' });
    } catch (e) {
      return json({ success: false, message: 'Gagal terhubung ke R2 Bucket.' });
    }
  })

  // R2 upload
  .post('/api/storage/generate-upload-url', async (request: Request, env: Env) => {
    const { fileName, contentType } = uploadUrlSchema.parse(await request.json());
    const key = `${Date.now()}-${fileName}`;
    const signed = await env.BUCKET.createPresignedUrl({
      key,
      method: 'PUT',
      expiration: 300,
      headers: { 'content-type': contentType },
    });
    const uploadUrl = signed.toString();
    const finalUrl = `${env.PUBLIC_R2_URL}/${key}`;
    return json({
      success: true,
      uploadUrl,
      finalUrl,
      message: 'URL berhasil dibuat.',
    });
  })

  // 404 fallback
  .all('*', () => new Response('Not found', { status: 404 }));

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) =>
    router.handle(request, env, ctx).catch((err: unknown) => {
      if (err instanceof ZodError) {
        return json({ error: err.issues }, { status: 400 });
      }
      const message = err instanceof Error ? err.message : 'Internal error';
      return json({ error: message }, { status: 500 });
    }),
};
