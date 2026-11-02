# CSVView — Pembaca File CSV Online

CSVView membuka file CSV sebagai tabel yang dapat dicari, diurutkan, dan dijelajahi melalui browser. Aplikasi ini dikembangkan untuk memeriksa data tabular tanpa memasang aplikasi spreadsheet.

Antarmuka berbahasa Indonesia memakai warna ivory, cobalt, oranye lembut, dan biru muda. Pagination membatasi jumlah baris yang dirender agar tabel tetap ringan.

## Fitur utama

- Memilih satu file CSV dari perangkat atau melalui drag-and-drop.
- Membaca header, data, dan informasi nama serta ukuran file.
- Menampilkan jumlah baris data, jumlah kolom, dan pemisah yang digunakan.
- Mendukung koma atau titik koma dengan deteksi otomatis dan pilihan manual.
- Menangani nilai berkutip, kutip ganda yang di-escape, koma dalam sel, sel kosong, baris multibaris, CRLF/LF, serta UTF-8 BOM.
- Mencari tanpa membedakan kapitalisasi pada seluruh kolom.
- Mengurutkan kolom menaik atau menurun tanpa mengubah data asli.
- Menampilkan 25 baris per halaman beserta nomor baris sumber.
- Mengosongkan pencarian, sorting, pagination, dan data ketika membuka file lain.

## Teknologi

CSVView menggunakan Laravel 13, Blade, PHP, HTML5, CSS3, JavaScript murni, File API, dan Vite. Font Inter disertakan beserta lisensinya. Parser dan logika tabel dipisahkan tanpa framework frontend atau dependency parser tambahan. Database tidak diperlukan.

## Cara menggunakan

1. Pilih atau jatuhkan satu file berekstensi `.csv`.
2. Tunggu pembacaan selesai, lalu periksa informasi file dan tabel.
3. Jika pemisah tidak sesuai, pilih koma atau titik koma.
4. Cari data melalui kolom pencarian atau klik header untuk mengurutkan.
5. Gunakan **Sebelumnya** dan **Berikutnya** untuk berpindah halaman.
6. Tekan **Pilih File Lain** untuk memulai kembali.

Pada ponsel, gulir horizontal hanya pada area tabel. Sel yang panjang tetap berupa teks dan dapat digulir. Header kosong diberi nama seperti “Kolom 1”; baris kosong dilewati. File yang hanya memiliki header menampilkan keadaan tanpa data.

## Privasi dan batasan

File dibaca lokal dan tidak dikirim ke Laravel, database, storage, API eksternal, atau layanan analitik. Isi sel dirender dengan `textContent`, sehingga HTML, JavaScript, dan formula tetap menjadi teks.

Batas aplikasi adalah 10 MB, 10.000 baris data, dan 200 kolom. Jika terlampaui, seluruh file ditolak tanpa hasil parsial. Encoding yang didukung adalah UTF-8 dengan atau tanpa BOM. Jumlah kolom setiap baris harus sesuai header. Angka standar dengan desimal titik dikenali; format mata uang tidak dinormalisasi. File kosong, encoding tidak valid, kutip rusak, dan kegagalan baca menampilkan pesan yang jelas.

## Menjalankan secara lokal

Gunakan PHP minimal 8.3, Composer 2, dan Node.js 22.12 atau lebih baru:

```sh
git clone https://github.com/AhmadNurHidayat-23/csvview-pembaca-file-csv.git
cd csvview-pembaca-file-csv
composer install
npm ci
cp .env.example .env
php artisan key:generate
npm run build
php artisan serve
```

Buka `http://localhost:8000`, atau `http://localhost:8888/csvview-pembaca-file-csv/public/` pada MAMP. MySQL dan migrasi tidak diperlukan.

Jalankan `php artisan test`, `npm test`, dan `npm run build`. Pengujian browser tersedia melalui `npm run test:browser`, kemudian buka `http://127.0.0.1:8020`.
