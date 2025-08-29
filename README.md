<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app
Dikembangkan dan diperbaharui sesuai kebutuhan logic system. Fitur yang dikelola : Data Pegawai, Data Komponen Gaji, Perhitungan Gaji standart perhitungan PPH, dan Integrasi dengan Whatsapp Getway API WAHA opensource. 

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1RQGhonswnVxkIaWJVIzkC4FDMb2nbNKu

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

**Step By Step:**
Dokumentasi Implementasi HRIS Kampus UNUGHA di Server Lokal
Dokumen ini menjelaskan proses untuk memasang dan menjalankan aplikasi HRIS Kampus UNUGHA pada lingkungan server lokal (on-premise).
1. Prasyarat Sistem
Sebelum memulai, pastikan server lokal Anda telah memenuhi persyaratan berikut:
Sistem Operasi: Distribusi Linux (disarankan Ubuntu Server 20.04 LTS atau lebih baru), Windows Server, atau macOS.
Node.js dan npm: Node.js versi 16 atau lebih baru. npm (Node Package Manager) biasanya sudah terpasang bersama Node.js. Anda bisa memeriksanya dengan perintah node -v dan npm -v.
Web Server: Nginx (disarankan) atau Apache. Web server ini akan berfungsi untuk menyajikan file aplikasi kepada pengguna.
Kode Sumber Aplikasi: Salinan lengkap dari semua file dan folder aplikasi HRIS UNUGHA.
2. Langkah-langkah Implementasi
Proses ini terdiri dari penyiapan proyek, membangun (build) aplikasi, dan mengonfigurasi web server.
Salin Kode Aplikasi: Transfer seluruh folder kode sumber aplikasi HRIS ke direktori di server Anda. Lokasi yang umum digunakan adalah di dalam /var/www/.
code
Bash
# Contoh: Membuat direktori dan menyalin file
sudo mkdir -p /var/www/hris-unugha
# Gunakan scp atau rsync untuk menyalin folder proyek Anda ke /var/www/hris-unugha
Masuk ke Direktori Proyek: Buka terminal di server Anda dan navigasi ke direktori tempat Anda menyimpan kode aplikasi.
code
Bash
cd /var/www/hris-unugha
Aplikasi ini memerlukan beberapa library eksternal (dependensi) untuk dapat berjalan. Instal semua dependensi menggunakan npm.
code
Bash
# Perintah ini akan membaca file package.json dan mengunduh semua library yang dibutuhkan
sudo npm install
Catatan: Proses ini mungkin memerlukan beberapa menit tergantung pada kecepatan koneksi internet server Anda.
Selanjutnya, kita perlu membangun versi produksi dari aplikasi. Proses ini akan mengoptimalkan dan menggabungkan semua file (JavaScript, CSS) ke dalam satu folder statis yang siap untuk disajikan oleh web server.
Jalankan perintah build:
code
Bash
sudo npm run build
Setelah selesai, akan muncul sebuah folder baru bernama build (atau terkadang dist) di dalam direktori proyek Anda. Folder inilah yang akan kita gunakan untuk deployment.
Kita akan mengonfigurasi Nginx untuk menyajikan file dari folder build yang telah kita buat.
Instal Nginx (jika belum ada):
code
Bash
# Untuk server berbasis Debian/Ubuntu
sudo apt update
sudo apt install nginx
Buat File Konfigurasi Baru: Buat sebuah file konfigurasi Nginx baru untuk aplikasi HRIS.
code
Bash
sudo nano /etc/nginx/sites-available/hris-unugha
Isi File Konfigurasi: Salin dan tempel konfigurasi berikut ke dalam file yang baru Anda buat.
code
Nginx
server {
    listen 80;
    server_name hris.unugha.local; # Anda bisa ganti dengan alamat IP server Anda, cth: 192.168.1.10

    # Tentukan lokasi folder build dari proyek Anda
    root /var/www/hris-unugha/build;
    index index.html index.htm;

    location / {
        # Baris ini sangat penting untuk aplikasi berbasis React (Single Page Application)
        # Ini memastikan semua rute akan diarahkan ke index.html
        try_files $uri /index.html;
    }

    # Opsional: Aturan caching untuk performa yang lebih baik
    location ~* \.(?:ico|css|js|gif|jpe?g|png)$ {
        expires 1M;
        add_header Cache-Control "public";
    }
}
Simpan file tersebut (di nano, tekan CTRL + X, lalu Y, lalu Enter).
Aktifkan Konfigurasi: Buat symbolic link dari file konfigurasi Anda ke direktori sites-enabled.
code
Bash
sudo ln -s /etc/nginx/sites-available/hris-unugha /etc/nginx/sites-enabled/
Test dan Restart Nginx: Pastikan tidak ada error pada konfigurasi, lalu restart layanan Nginx.
code
Bash
sudo nginx -t
# Jika outputnya "test is successful", lanjutkan dengan restart
sudo systemctl restart nginx
Sekarang, aplikasi HRIS UNUGHA sudah berjalan di server lokal Anda. Buka browser di komputer yang terhubung ke jaringan yang sama dengan server, lalu akses melalui:
http://<ALAMAT_IP_SERVER_ANDA>
Contoh: http://192.168.1.10
Anda akan disambut dengan halaman login aplikasi HRIS.
3. Pertimbangan Tambahan
Koneksi Database: Aplikasi saat ini menggunakan data tiruan (mock data). Untuk implementasi nyata, Anda perlu menghubungkan aplikasi ke database (seperti MySQL atau PostgreSQL). Ini biasanya melibatkan pengaturan variabel lingkungan (environment variables) di dalam file .env pada direktori proyek sebelum menjalankan npm run build.
Keamanan: Untuk lingkungan produksi yang diakses secara publik, sangat disarankan untuk mengaktifkan HTTPS dengan sertifikat SSL/TLS untuk mengenkripsi komunikasi antara pengguna dan server.
Pembaruan Aplikasi: Untuk memperbarui aplikasi, ulangi proses dari Langkah 1 (salin kode baru), Langkah 2 (jalankan npm install jika ada dependensi baru), dan Langkah 3 (jalankan npm run build). Web server tidak perlu dikonfigurasi ulang kecuali jika ada perubahan fundamental pada struktur aplikasi.
