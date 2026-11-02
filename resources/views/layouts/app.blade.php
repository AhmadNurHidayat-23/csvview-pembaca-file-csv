<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Buka file CSV secara lokal, cari data, urutkan kolom, dan jelajahi tabel tanpa mengunggah file menggunakan CSVView.">
    <meta name="theme-color" content="#f7f3e9">
    <title>CSVView — Pembaca File CSV Online</title>
    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <a class="skip-link" href="#file-area">Langsung ke pembaca CSV</a>
    <header class="site-header wrap">
        <a class="wordmark" href="{{ route('home') }}" aria-label="CSVView, halaman utama">csvview<span>.</span></a>
        <span class="header-note">Data tetap di perangkat Anda.</span>
    </header>
    <main class="wrap">@yield('content')</main>
    <footer class="site-footer wrap"><p>CSVView — Pembaca File CSV Online.</p><span>Dibaca lokal. Tanpa unggah.</span></footer>
</body>
</html>
