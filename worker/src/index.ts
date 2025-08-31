import { LeaveStatus } from '../../types';
import {
  mockEmployees,
  mockLeaveRequests,
  mockPayslips,
  mockUsers,
} from '../../data/mockData';

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  PUBLIC_R2_URL: string;
}

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    try {
      // Employees
      if (url.pathname === '/api/employees') {
        if (request.method === 'GET') {
          return json(mockEmployees);
        }
        if (request.method === 'POST') {
          const body = await request.json();
          const newEmployee = { id: `E${Date.now()}`, ...body };
          mockEmployees.push(newEmployee);
          return json(newEmployee, { status: 201 });
        }
      }

      if (url.pathname.startsWith('/api/employees/')) {
        const id = url.pathname.split('/')[3];
        const index = mockEmployees.findIndex((e) => e.id === id);
        if (request.method === 'PUT') {
          if (index === -1) return json({ message: 'Pegawai tidak ditemukan.' }, { status: 404 });
          const body = await request.json();
          mockEmployees[index] = { ...mockEmployees[index], ...body };
          return json(mockEmployees[index]);
        }
        if (request.method === 'DELETE') {
          if (index === -1) return json({ message: 'Pegawai tidak ditemukan.' }, { status: 404 });
          mockEmployees.splice(index, 1);
          return json({ message: 'Pegawai berhasil dihapus.' });
        }
      }

      // Leave requests
      if (url.pathname === '/api/leave-requests') {
        if (request.method === 'GET') {
          return json(mockLeaveRequests);
        }
        if (request.method === 'POST') {
          const body = await request.json();
          const newRequest = {
            id: `L${Date.now()}`,
            status: LeaveStatus.PENDING,
            ...body,
          };
          mockLeaveRequests.push(newRequest);
          return json(newRequest, { status: 201 });
        }
      }

      if (url.pathname.startsWith('/api/leave-requests/') && url.pathname.endsWith('/status') && request.method === 'PUT') {
        const parts = url.pathname.split('/');
        const id = parts[3];
        const body = await request.json();
        const requestIndex = mockLeaveRequests.findIndex((r) => r.id === id);
        if (requestIndex === -1) return json({ message: 'Permohonan tidak ditemukan.' }, { status: 404 });
        mockLeaveRequests[requestIndex].status = body.status;
        return json(mockLeaveRequests[requestIndex]);
      }

      // Payslips
      if (url.pathname === '/api/payslips' && request.method === 'GET') {
        const period = url.searchParams.get('period');
        const list = period ? mockPayslips.filter((p) => p.period === period) : mockPayslips;
        return json(list);
      }

      if (url.pathname === '/api/payroll/generate' && request.method === 'POST') {
        return json({ success: true, message: 'Payroll berhasil dibuat.' });
      }

      // Authentication
      if (url.pathname === '/api/login' && request.method === 'POST') {
        const { email, password } = await request.json();
        const user = mockUsers.find((u) => u.email === email && u.password === password);
        if (!user) {
          return json({ success: false, message: 'Email atau kata sandi salah.' }, { status: 401 });
        }
        const { password: _pw, ...userData } = user;
        return json({ success: true, user: userData });
      }

      // D1 settings
      if (url.pathname === '/api/settings/database') {
        if (request.method === 'GET') {
          const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
            .bind('d1')
            .first<{ value: string }>();
          const settings = row ? JSON.parse(row.value) : { enabled: false, accountId: '', databaseId: '', authToken: '' };
          delete settings.authToken;
          return json(settings);
        }
        if (request.method === 'POST') {
          const body = await request.json();
          await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
            .bind('d1', JSON.stringify(body))
            .run();
          return json({ message: 'Pengaturan berhasil disimpan.' });
        }
      }

      if (url.pathname === '/api/settings/database/test' && request.method === 'POST') {
        try {
          await env.DB.prepare('SELECT 1').first();
          return json({ success: true, message: 'Koneksi ke database berhasil.' });
        } catch (e) {
          return json({ success: false, message: 'Gagal terhubung ke database.' });
        }
      }

      if (url.pathname === '/api/database/seed' && request.method === 'POST') {
        return json({ success: true, message: '\u2713 Data contoh berhasil disalin ke Cloudflare D1!' });
      }

      // R2 settings
      if (url.pathname === '/api/settings/storage') {
        if (request.method === 'GET') {
          const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
            .bind('r2')
            .first<{ value: string }>();
          const settings = row ? JSON.parse(row.value) : { enabled: false, accountId: '', bucketName: '', accessKeyId: '', secretAccessKey: '' };
          delete settings.accessKeyId;
          delete settings.secretAccessKey;
          return json(settings);
        }
        if (request.method === 'POST') {
          const body = await request.json();
          await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
            .bind('r2', JSON.stringify(body))
            .run();
          return json({ message: 'Pengaturan penyimpanan berhasil disimpan.' });
        }
      }

      if (url.pathname === '/api/settings/storage/test' && request.method === 'POST') {
        try {
          await env.BUCKET.list({ limit: 1 });
          return json({ success: true, message: 'Koneksi ke R2 Bucket berhasil.' });
        } catch (e) {
          return json({ success: false, message: 'Gagal terhubung ke R2 Bucket.' });
        }
      }

      if (url.pathname === '/api/storage/generate-upload-url' && request.method === 'POST') {
        const { fileName, contentType } = await request.json();
        const key = `${Date.now()}-${fileName}`;
        const signed = await env.BUCKET.createPresignedUrl({
          key,
          method: 'PUT',
          expiration: 300,
          headers: { 'content-type': contentType },
        });
        const uploadUrl = signed.toString();
        const finalUrl = `${env.PUBLIC_R2_URL}/${key}`;
        return json({ success: true, uploadUrl, finalUrl, message: 'URL berhasil dibuat.' });
      }

      return new Response('Not found', { status: 404 });
    } catch (err: any) {
      return json({ error: err.message || 'Internal error' }, { status: 500 });
    }
  },
};
