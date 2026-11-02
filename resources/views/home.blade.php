@extends('layouts.app')

@section('content')
    <section class="intro" aria-labelledby="page-title">
        <p class="eyebrow">PEMBACA DATA CSV</p>
        <h1 id="page-title">Baca File CSV dengan Mudah.</h1>
        <p class="description">Buka, cari, dan jelajahi data CSV langsung dari browser tanpa aplikasi tambahan.</p>
    </section>

    <section class="workspace" aria-label="Pembaca file CSV">
        <div class="file-area" id="file-area" aria-describedby="file-hint">
            <input type="file" id="file-input" accept=".csv,text/csv" hidden>
            <div class="file-copy">
                <div class="file-icon" id="file-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="5" width="22" height="22" rx="2"/><path d="M5 13h22M5 20h22M13 13v14"/></svg></div>
                <div class="file-description">
                    <h2 id="file-title">Mulai dengan file CSV Anda.</h2>
                    <p id="file-hint">Tarik file ke sini atau pilih dari perangkat Anda.</p>
                    <p id="file-details" hidden></p>
                    <p class="file-limit">CSV UTF-8 · Maks. 10 MB · 10.000 baris data</p>
                </div>
            </div>
            <div class="file-actions">
                <div class="delimiter-control" id="delimiter-control" hidden>
                    <label for="delimiter-input">Pemisah kolom</label>
                    <select id="delimiter-input"><option value="auto">Otomatis</option><option value=",">Koma (,)</option><option value=";">Titik koma (;)</option></select>
                </div>
                <button class="button" id="choose-button" type="button" disabled>Pilih File CSV <span aria-hidden="true">↗</span></button>
                <button class="button button-secondary" id="reset-button" type="button" hidden>Pilih File Lain</button>
            </div>
        </div>
        <div class="feedback">
            <p class="process-status" id="process-status" role="status" aria-live="polite" aria-atomic="true"></p>
            <p class="error-message" id="file-error" role="alert" hidden></p>
            <noscript><p class="error-message">Aktifkan JavaScript untuk membaca dan menjelajahi file CSV.</p></noscript>
        </div>

        <div class="viewer" id="viewer" hidden>
            <div class="table-toolbar">
                <div class="search-field"><label for="search-input">Cari data</label><input id="search-input" type="search" placeholder="Cari di seluruh kolom…" autocomplete="off" spellcheck="false"></div>
                <div class="table-information"><p id="result-count" role="status" aria-live="polite"></p><p id="sort-hint">Klik header kolom untuk mengurutkan.</p></div>
            </div>
            <p class="scroll-hint">Geser area tabel untuk melihat kolom lainnya.</p>
            <div class="table-scroll" id="table-scroll" tabindex="0" role="region" aria-label="Tabel data CSV yang dapat digulir" aria-describedby="sort-hint">
                <table id="data-table"><caption class="sr-only">Isi file CSV. Header kolom dapat digunakan untuk mengurutkan data.</caption><thead id="table-head"></thead><tbody id="table-body"></tbody></table>
            </div>
            <div class="empty-state" id="empty-state" hidden></div>
            <div class="pagination">
                <p id="page-summary"></p>
                <div class="page-actions"><button class="page-button" type="button" id="previous-button" disabled>Sebelumnya</button><span id="page-label" aria-live="polite"></span><button class="page-button" type="button" id="next-button" disabled>Berikutnya</button></div>
            </div>
        </div>
    </section>
    <p class="privacy-note"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>File dibaca di browser. Data tidak diunggah, disimpan, atau dikirim ke layanan lain.</p>
@endsection
