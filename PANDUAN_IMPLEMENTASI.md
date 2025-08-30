# Panduan Implementasi: Konfigurasi Database Cloudflare D1

Dokumen ini memberikan panduan teknis untuk mengimplementasikan fungsionalitas backend yang diperlukan untuk halaman "Konfigurasi Database" pada aplikasi HRIS UNUGHA.

## 1. Pendahuluan

Halaman **Pengaturan > Konfigurasi Database** (`DatabaseSettingsManagement.tsx`) menyediakan antarmuka bagi admin untuk mengelola dan memverifikasi koneksi ke database eksternal, dalam hal ini Cloudflare D1. Tujuannya adalah untuk memungkinkan sinkronisasi data antara aplikasi HRIS dan database cloud secara aman.

**Penting:** Komponen frontend yang telah dibuat **HANYA** berfungsi sebagai antarmuka pengguna (UI). Logika untuk menyimpan kredensial, menguji koneksi, dan berinteraksi dengan Cloudflare D1 **HARUS** diimplementasikan di sisi **backend** untuk alasan keamanan.

## 2. Arsitektur yang Direkomendasikan

Arsitektur yang aman dan tepat untuk fitur ini adalah sebagai berikut:

1.  **Frontend (Aplikasi React)**: Menampilkan form untuk memasukkan kredensial (Account ID, Database ID, API Token).
2.  **Backend (API Server)**:
    *   Menyediakan endpoint API untuk menerima, menyimpan, dan mengambil pengaturan koneksi database.
    *   Menyimpan kredensial secara aman (misalnya, dienkripsi dalam database utama aplikasi atau menggunakan layanan manajemen rahasia).
    *   Menyediakan endpoint API untuk menguji koneksi ke Cloudflare D1 menggunakan kredensial yang tersimpan.
    *   Menangani semua interaksi langsung dengan Cloudflare D1 API. **Kredensial D1 tidak boleh diekspos ke frontend.**



## 3. Alur Kerja Frontend

Komponen `DatabaseSettingsManagement.tsx` memiliki alur kerja berikut:

1.  **Saat Halaman Dimuat**:
    *   Frontend akan melakukan permintaan `GET` ke API backend untuk mengambil pengaturan database yang ada saat ini.
    *   Form akan diisi dengan data yang diterima dari backend.

2.  **Saat Tombol "Uji Koneksi" Diklik**:
    *   Frontend mengirimkan permintaan `POST` ke endpoint "test connection" di backend.
    *   Frontend **tidak mengirimkan kredensial** dalam permintaan ini. Backend sudah memiliki kredensial yang tersimpan.
    *   Backend menerima permintaan, mengambil kredensial yang tersimpan, dan mencoba melakukan koneksi (misalnya, query sederhana seperti `SELECT 1;`) ke Cloudflare D1.
    *   Backend merespons dengan status sukses atau gagal, yang kemudian ditampilkan di UI.

3.  **Saat Tombol "Simpan Pengaturan" Diklik**:
    *   Frontend mengirimkan permintaan `POST` atau `PUT` ke API backend dengan membawa data pengaturan baru (accountId, databaseId, authToken, enabled).
    *   Backend memvalidasi dan menyimpan pengaturan ini secara aman.
    *   Backend merespons dengan status sukses, dan frontend menampilkan notifikasi.

## 4. Spesifikasi API Backend (Saran)

Berikut adalah contoh spesifikasi endpoint API yang perlu dibuat di backend.

---

### A. Mengambil Pengaturan Database

-   **Endpoint**: `GET /api/settings/database`
-   **Method**: `GET`
-   **Deskripsi**: Mengambil konfigurasi database D1 yang sedang aktif.
-   **Response Sukses (200 OK)**:
    ```json
    {
      "enabled": true,
      "accountId": "cloudflare_account_id_from_db",
      "databaseId": "d1_database_id_from_db",
      "authToken": "" // Penting: Jangan pernah mengirim token kembali ke client
    }
    ```

---

### B. Menyimpan Pengaturan Database

-   **Endpoint**: `POST /api/settings/database`
-   **Method**: `POST`
-   **Deskripsi**: Menyimpan atau memperbarui konfigurasi database D1.
-   **Request Body**:
    ```json
    {
      "enabled": true,
      "accountId": "user_input_account_id",
      "databaseId": "user_input_database_id",
      "authToken": "user_input_auth_token"
    }
    ```
-   **Tindakan Backend**:
    1.  Validasi input.
    2.  Enkripsi `authToken` sebelum menyimpannya ke database.
    3.  Simpan pengaturan ke database.
-   **Response Sukses (200 OK)**:
    ```json
    {
      "message": "Pengaturan berhasil disimpan."
    }
    ```

---

### C. Menguji Koneksi Database

-   **Endpoint**: `POST /api/settings/database/test`
-   **Method**: `POST`
-   **Deskripsi**: Menguji koneksi ke Cloudflare D1 menggunakan kredensial yang sudah tersimpan di backend.
-   **Request Body**: (Kosong)
-   **Tindakan Backend**:
    1.  Ambil kredensial yang tersimpan dan terdekripsi dari database.
    2.  Lakukan permintaan API sederhana ke Cloudflare D1 (contoh: `https://api.cloudflare.com/client/v4/accounts/{accountId}/d1/database/{databaseId}/query`).
    3.  Berdasarkan respons dari Cloudflare, kirim kembali status ke frontend.
-   **Response Sukses (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Koneksi ke database berhasil."
    }
    ```
-   **Response Gagal (400 Bad Request / 500 Internal Server Error)**:
    ```json
    {
      "success": false,
      "message": "Gagal terhubung: Kredensial tidak valid atau terjadi kesalahan server."
    }
    ```

## 5. Pertimbangan Keamanan

-   **Jangan Simpan Kredensial di Frontend**: `API Token` atau `Auth Token` sangat sensitif. Jangan pernah menyimpannya di `localStorage`, `sessionStorage`, atau state React yang bisa diakses oleh pengguna.
-   **Gunakan HTTPS**: Pastikan semua komunikasi antara frontend dan backend menggunakan HTTPS.
-   **Enkripsi di Backend**: Simpan `authToken` dalam keadaan terenkripsi di database utama Anda.
-   **Validasi di Backend**: Lakukan validasi semua input yang diterima dari frontend di sisi backend.

## 6. Langkah Selanjutnya untuk Tim Backend

1.  Buat tiga endpoint API seperti yang dijelaskan di atas (`GET /api/settings/database`, `POST /api/settings/database`, `POST /api/settings/database/test`).
2.  Implementasikan logika untuk menyimpan dan mengambil pengaturan dari database aplikasi Anda. Pastikan untuk mengenkripsi token.
3.  Gunakan HTTP client di backend (seperti `axios` atau `node-fetch`) untuk berinteraksi dengan Cloudflare D1 API pada endpoint "test connection".
4.  Hubungkan logika ini ke komponen frontend `DatabaseSettingsManagement.tsx` dengan menyesuaikan URL API jika diperlukan.