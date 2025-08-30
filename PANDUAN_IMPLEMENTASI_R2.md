# Panduan Implementasi Backend: Cloudflare R2

Dokumen ini memberikan panduan teknis bagi tim backend untuk mengimplementasikan fungsionalitas yang diperlukan untuk halaman "Penyimpanan Objek (R2)" dan fitur unggah file pada aplikasi HRIS UNUGHA.

## 1. Pendahuluan

Integrasi Cloudflare R2 memungkinkan aplikasi untuk menyimpan file secara persisten, seperti dokumen pendukung cuti. Komponen frontend (`R2StorageManagement.tsx` dan `AddLeaveRequestModal.tsx`) berfungsi sebagai antarmuka pengguna, sementara semua logika yang berhubungan dengan kredensial dan interaksi API dengan Cloudflare R2 **HARUS** ditangani oleh backend untuk menjaga keamanan.

## 2. Arsitektur & Alur Kerja

-   **Frontend (Aplikasi React)**: Menampilkan form pengaturan R2 dan menyediakan antarmuka untuk memilih file yang akan diunggah.
-   **Backend (API Server)**:
    -   Menyediakan endpoint API untuk menyimpan dan mengambil konfigurasi R2.
    -   Menyimpan kredensial R2 (Access Key ID & Secret Access Key) secara aman, misalnya dienkripsi di database atau menggunakan secret manager.
    -   Menyediakan endpoint untuk menguji koneksi ke R2 menggunakan kredensial yang tersimpan.
    -   Menyediakan endpoint untuk menghasilkan **pre-signed URL** yang aman untuk proses unggah file.

## 3. Alur Kerja Unggah File (Metode Pre-signed URL)

Ini adalah metode yang paling direkomendasikan karena aman dan efisien. Beban unggah file tidak melalui server backend Anda, melainkan langsung dari browser klien ke R2.

1.  **Pengguna Memilih File**: Di frontend (misalnya, pada modal pengajuan cuti), pengguna memilih file untuk diunggah.
2.  **Frontend Meminta Izin Unggah**: Frontend mengirimkan permintaan ke backend (misalnya, ke `POST /api/storage/generate-upload-url`) dengan metadata file (nama file, tipe konten).
3.  **Backend Membuat Pre-signed URL**: Backend menerima permintaan, memvalidasinya, lalu menggunakan kredensial R2 yang tersimpan dan SDK Cloudflare/AWS S3 untuk membuat URL unggah yang unik, aman, dan berbatas waktu.
4.  **Backend Mengirim URL ke Frontend**: Backend merespons permintaan frontend dengan mengirimkan `uploadUrl` (URL untuk unggah) dan `finalUrl` (URL publik file setelah diunggah).
5.  **Frontend Mengunggah File**: Frontend menggunakan `fetch` API dengan method `PUT` untuk mengunggah file yang dipilih pengguna langsung ke `uploadUrl` yang diterima dari backend.
6.  **Frontend Menyimpan URL Final**: Setelah unggahan berhasil, frontend menyimpan `finalUrl` sebagai bagian dari data lain yang akan dikirim (misalnya, dalam data pengajuan cuti).

## 4. Spesifikasi API Backend (Saran)

---

### A. Mengambil Pengaturan R2

-   **Endpoint**: `GET /api/settings/storage`
-   **Deskripsi**: Mengambil konfigurasi R2 yang aktif.
-   **Response Sukses (200 OK)**:
    ```json
    {
      "enabled": true,
      "accountId": "cloudflare_account_id_from_db",
      "bucketName": "r2_bucket_name_from_db"
    }
    ```
    *Penting: Jangan pernah mengirim `accessKeyId` atau `secretAccessKey` ke client.*

---

### B. Menyimpan Pengaturan R2

-   **Endpoint**: `POST /api/settings/storage`
-   **Deskripsi**: Menyimpan atau memperbarui konfigurasi R2.
-   **Request Body**:
    ```json
    {
      "enabled": true,
      "accountId": "...",
      "bucketName": "...",
      "accessKeyId": "...",
      "secretAccessKey": "..."
    }
    ```
-   **Tindakan Backend**: Validasi input, enkripsi `accessKeyId` dan `secretAccessKey`, lalu simpan ke database.
-   **Response Sukses (200 OK)**: `{"message": "Pengaturan berhasil disimpan."}`

---

### C. Menguji Koneksi R2

-   **Endpoint**: `POST /api/settings/storage/test`
-   **Deskripsi**: Menguji koneksi ke R2 menggunakan kredensial yang tersimpan.
-   **Tindakan Backend**: Ambil kredensial terdekripsi, lakukan operasi sederhana ke R2 (misalnya, `HeadBucket` atau `ListObjectsV2` dengan `MaxKeys: 1`).
-   **Response Sukses (200 OK)**: `{"success": true, "message": "Koneksi ke R2 Bucket berhasil."}`
-   **Response Gagal**: `{"success": false, "message": "Gagal terhubung: Kredensial tidak valid."}`

---

### D. Menghasilkan URL Unggah (Pre-signed URL)

-   **Endpoint**: `POST /api/storage/generate-upload-url`
-   **Deskripsi**: Membuat URL sekali pakai untuk unggah file.
-   **Request Body**:
    ```json
    {
      "fileName": "surat_dokter_budi.pdf",
      "contentType": "application/pdf"
    }
    ```
-   **Tindakan Backend**:
    1.  Gunakan SDK (misalnya, `@aws-sdk/s3-request-presigner` yang dikonfigurasi untuk endpoint R2) untuk membuat pre-signed URL untuk operasi `PutObject`.
    2.  Atur waktu kedaluwarsa yang singkat (misalnya, 5 menit).
-   **Response Sukses (200 OK)**:
    ```json
    {
      "success": true,
      "uploadUrl": "https://<bucket>.<accountid>.r2.cloudflarestorage.com/...?X-Amz-Algorithm=...",
      "finalUrl": "https://pub-<your-public-r2-domain>/<unique-file-name>"
    }
    ```
-   **Response Gagal**: `{"success": false, "message": "Gagal membuat URL unggah."}`

## 5. Pertimbangan Keamanan

-   **Jangan Pernah Ekspos Kredensial**: `Access Key ID` dan `Secret Access Key` tidak boleh ada di kode frontend atau dikirim ke client.
-   **Gunakan Pre-signed URL**: Ini adalah praktik standar untuk unggahan file yang aman dari sisi klien.
-   **Waktu Kedaluwarsa Singkat**: Atur waktu kedaluwarsa yang pendek (5-15 menit) untuk pre-signed URL untuk membatasi jendela potensi penyalahgunaan.
-   **Validasi di Backend**: Selalu validasi tipe file, ukuran, dan metadata lainnya di backend sebelum membuat pre-signed URL.
