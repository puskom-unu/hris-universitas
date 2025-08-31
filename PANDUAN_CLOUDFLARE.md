# Panduan Konfigurasi Cloudflare D1 dan R2 untuk HRIS UNUGHA

Dokumen ini menjelaskan langkah-langkah untuk menyiapkan database Cloudflare D1 dan penyimpanan objek Cloudflare R2 yang diperlukan agar aplikasi HRIS UNUGHA dapat berfungsi dengan penyimpanan data persisten di cloud.

## Prasyarat

-   Akun Cloudflare yang aktif.
-   (Opsional) [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) terinstal jika Anda ingin mengelola sumber daya melalui baris perintah.

---

## Bagian 1: Konfigurasi Cloudflare D1 (Database)

Cloudflare D1 akan digunakan sebagai database utama untuk menyimpan semua data aplikasi, seperti data pegawai, absensi, cuti, dan lain-lain.

### Langkah 1: Membuat Database D1

1.  Login ke [Dashboard Cloudflare](https://dash.cloudflare.com/).
2.  Di menu sebelah kiri, navigasi ke **Workers & Pages** > **D1**.
3.  Klik **Create database**.
4.  Masukkan nama database, misalnya `hris-unugha-db`.
5.  Pilih lokasi yang paling dekat dengan pengguna Anda.
6.  Klik **Create**.

### Langkah 2: Mendapatkan Kredensial Database

Setelah database dibuat, Anda akan diarahkan ke halaman detailnya. Kredensial yang Anda butuhkan untuk dimasukkan ke dalam aplikasi HRIS adalah:

1.  **Account ID**: Dapat ditemukan di menu sebelah kanan pada halaman utama dashboard Cloudflare Anda atau di halaman overview Workers & Pages.
2.  **Database ID**: Dapat ditemukan di halaman detail database D1 yang baru saja Anda buat, di bawah nama database.

### Langkah 3: Membuat API Token

Aplikasi memerlukan token API untuk berinteraksi dengan D1 secara aman dari backend.

1.  Dari dashboard Cloudflare, klik ikon profil Anda di kanan atas, lalu pilih **My Profile**.
2.  Navigasi ke tab **API Tokens**.
3.  Klik **Create Token**.
4.  Di bawah "Custom token", klik **Get started**.
5.  Beri nama token, misalnya `hris-d1-access`.
6.  Pada bagian **Permissions**, atur sebagai berikut:
    *   Pilih `Account`.
    *   Pilih `D1`.
    *   Pilih `Edit`.
7.  Pada bagian **Account Resources**, pilih akun Anda.
8.  Lanjutkan dan klik **Create Token**.
9.  **Salin dan simpan token yang dihasilkan di tempat yang aman.** Anda hanya akan melihatnya sekali. Token ini akan digunakan sebagai **API Token / Auth Token** di aplikasi.

### Langkah 4: Memasukkan Kredensial ke Aplikasi

1.  Buka aplikasi HRIS UNUGHA.
2.  Navigasi ke **Pengaturan** > **Konfigurasi Database**.
3.  Masukkan **Account ID**, **Database ID**, dan **API Token** yang telah Anda dapatkan ke dalam form yang sesuai.
4.  Aktifkan sinkronisasi dan simpan pengaturan.

---

## Bagian 2: Konfigurasi Cloudflare R2 (Penyimpanan Objek)

Cloudflare R2 akan digunakan untuk menyimpan file seperti dokumen pendukung cuti, foto profil, dan lampiran lainnya.

### Langkah 1: Membuat Bucket R2

1.  Di Dashboard Cloudflare, navigasi ke **R2**.
2.  Klik **Create bucket**.
3.  Masukkan nama bucket yang unik secara global, misalnya `hris-unugha-dokumen`.
4.  Klik **Create bucket**.

### Langkah 2: Mendapatkan Kredensial R2

1.  **Account ID**: Sama seperti Account ID yang digunakan untuk D1.

### Langkah 3: Membuat Token API R2

1.  Kembali ke halaman utama **R2**.
2.  Di menu sebelah kanan, klik **Manage R2 API Tokens**.
3.  Klik **Create API token**.
4.  Beri nama token, misalnya `hris-r2-access`.
5.  Pada bagian **Permissions**, pilih **Object Read & Write**.
6.  Klik **Create API token**.
7.  Anda akan melihat **Access Key ID** dan **Secret Access Key**. **Salin dan simpan keduanya di tempat yang aman.** Anda tidak akan bisa melihat Secret Access Key lagi.

### Langkah 4: Memasukkan Kredensial ke Aplikasi

1.  Buka aplikasi HRIS UNUGHA.
2.  Navigasi ke **Pengaturan** > **Penyimpanan Objek (R2)**.
3.  Masukkan **Account ID**, **Nama Bucket**, **Access Key ID**, dan **Secret Access Key** ke dalam form.
4.  Aktifkan penyimpanan dan simpan pengaturan.

### Langkah 5: Mengatur CORS (Penting!)

Agar aplikasi dapat mengunggah dan menampilkan file dari R2, Anda perlu mengkonfigurasi CORS (Cross-Origin Resource Sharing) pada bucket Anda.

1.  Navigasi ke halaman detail bucket R2 Anda.
2.  Buka tab **Settings**.
3.  Gulir ke bawah ke bagian **CORS Policy** dan klik **Add CORS policy**.
4.  Salin dan tempel konfigurasi JSON berikut. **PENTING: Ganti `https://your-app-domain.com` dengan domain tempat aplikasi HRIS Anda di-hosting. Jika Anda menjalankan secara lokal, Anda mungkin perlu menambahkan `http://localhost:3000` atau port sejenis.**

```json
[
  {
    "AllowedOrigins": [
      "https://your-app-domain.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```
5.  Klik **Save**.

---

## Bagian 3: Skema Database Awal (Opsional)

Untuk memulai, Anda dapat menjalankan perintah SQL berikut di tab **Console** pada database D1 Anda untuk membuat tabel-tabel dasar yang dibutuhkan oleh aplikasi.

```sql
CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nip TEXT NOT NULL UNIQUE,
    position TEXT,
    unit TEXT,
    email TEXT UNIQUE,
    whatsappNumber TEXT,
    status TEXT DEFAULT 'Active',
    avatarUrl TEXT,
    joinDate TEXT,
    bankName TEXT,
    accountNumber TEXT
);

CREATE TABLE positions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT
);

CREATE TABLE leave_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    defaultDays INTEGER
);

CREATE TABLE leave_requests (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT,
    leaveType TEXT,
    startDate TEXT,
    endDate TEXT,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    approver TEXT,
    documentName TEXT,
    documentUrl TEXT
);
```

Dengan mengikuti panduan ini, Anda telah berhasil mengkonfigurasi infrastruktur cloud yang diperlukan untuk menjalankan aplikasi HRIS UNUGHA dengan data yang persisten dan aman.

## Bagian 4: Menyuntikkan Konfigurasi ke Lingkungan Produksi

Gunakan variabel lingkungan pada Cloudflare Worker untuk menyimpan konfigurasi tanpa mengungkapkan nilai rahasia ke klien.

1. Masukkan nilai non-sensitif seperti `WAHA_ENDPOINT` dan `WAHA_SESSION_NAME` pada bagian `[vars]` di `wrangler.toml`.
2. Simpan nilai rahasia seperti token API menggunakan perintah Wrangler:

   ```bash
   wrangler secret put WAHA_API_KEY
   ```

3. Worker menyediakan endpoint `GET /api/config/status` untuk memeriksa apakah konfigurasi telah diisi tanpa menampilkan nilai rahasia.
