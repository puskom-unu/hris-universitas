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
