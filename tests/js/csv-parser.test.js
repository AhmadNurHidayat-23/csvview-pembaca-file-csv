import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectDelimiter, MAX_COLUMNS, MAX_ROWS, parseCSV } from '../../resources/js/csv-parser.js';

test('koma, header, sel kosong, dan pemisah terakhir dipertahankan', () => {
    assert.deepEqual(parseCSV('Nama,Kota,Catatan\nAyu,Bandung,\nBima,,Ada'), {
        headers: ['Nama', 'Kota', 'Catatan'], rows: [['Ayu', 'Bandung', ''], ['Bima', '', 'Ada']], delimiter: ',',
    });
});

test('deteksi titik koma mengabaikan koma di dalam header berkutip', () => {
    const result = parseCSV('"Nama, lengkap";Kota\r\n"Ayu, Putri";Bandung');
    assert.equal(result.delimiter, ';');
    assert.deepEqual(result.headers, ['Nama, lengkap', 'Kota']);
    assert.deepEqual(result.rows, [['Ayu, Putri', 'Bandung']]);
});

test('kutip ganda yang di-escape menjadi satu kutip', () => {
    assert.deepEqual(parseCSV('Catatan\n"Dia berkata ""halo""."').rows, [['Dia berkata "halo".']]);
});

test('baris baru LF dan CRLF di dalam sel berkutip tetap berada dalam satu rekaman', () => {
    const result = parseCSV('Nama,Catatan\r\nAyu,"Baris 1\r\nBaris 2\nBaris 3"\r\nBima,Selesai');
    assert.equal(result.rows.length, 2);
    assert.equal(result.rows[0][1], 'Baris 1\r\nBaris 2\nBaris 3');
});

for (const newline of ['\n', '\r\n', '\r']) {
    test(`pemisah baris ${JSON.stringify(newline)} dan newline akhir tidak membuat baris semu`, () => {
        assert.deepEqual(parseCSV(`A,B${newline}1,2${newline}3,4${newline}`).rows, [['1', '2'], ['3', '4']]);
    });
}

test('UTF-8 BOM, Unicode, dan header berkutip ditangani', () => {
    const result = parseCSV('\uFEFF"Nama";Catatan\nAyu;"Halo 👋 — 日本語"');
    assert.deepEqual(result.headers, ['Nama', 'Catatan']);
    assert.deepEqual(result.rows, [['Ayu', 'Halo 👋 — 日本語']]);
});

test('baris kosong dilewati, baris dengan sel kosong tetap dihitung', () => {
    assert.deepEqual(parseCSV('\nA,B\n\n,\n\n').rows, [['', '']]);
    assert.deepEqual(parseCSV('Nilai\n""\n').rows, [['']]);
});

test('spasi isi sel dan header dipertahankan, header kosong diberi nama', () => {
    const result = parseCSV('," Nama ",Nama\n"  Ayu  ", 3 ,x');
    assert.deepEqual(result.headers, ['Kolom 1', ' Nama ', 'Nama']);
    assert.deepEqual(result.rows, [['  Ayu  ', ' 3 ', 'x']]);
});

test('file yang hanya berisi header menghasilkan nol baris data', () => {
    const result = parseCSV('Nama,Nilai\n');
    assert.equal(result.headers.length, 2);
    assert.deepEqual(result.rows, []);
});

test('deteksi berhenti pada header satu kolom, delimiter dapat dipilih manual', () => {
    assert.equal(detectDelimiter('Catatan\nteks;lanjutan'), ',');
    assert.equal(parseCSV('A;B\n1;2', ';').headers.length, 2);
    assert.equal(parseCSV('A;B\n1;2', ',').headers.length, 1);
    assert.throws(() => parseCSV('A\n1', '\t'), /pemisah/);
});

test('file kosong, BOM saja, dan teks biner ditolak', () => {
    for (const text of ['', '\n\r\n', '  ', '\uFEFF']) assert.throws(() => parseCSV(text), /kosong/);
    assert.throws(() => parseCSV('A,B\n1,\0'), /UTF-8/);
});

test('kutip tidak tertutup, kutip di tengah sel, dan karakter setelah kutip ditolak', () => {
    for (const text of ['A\n"belum selesai', 'A\nbe"nar', 'A\n"isi"x']) assert.throws(() => parseCSV(text), /kutip/);
    assert.deepEqual(parseCSV('A,B\n"isi" ,"nilai"\t').rows, [['isi', 'nilai']]);
});

test('jumlah kolom yang tidak sesuai header ditolak dengan nomor baris data', () => {
    assert.throws(() => parseCSV('A,B\n1,2\n3'), /baris data 2/);
    assert.throws(() => parseCSV('A,B\n1,2,3'), /header/);
});

test('10.000 baris diterima dan kelebihannya ditolak tanpa hasil parsial', () => {
    const text = `Nilai\n${Array(MAX_ROWS).fill('x').join('\n')}`;
    assert.equal(parseCSV(text).rows.length, MAX_ROWS);
    assert.throws(() => parseCSV(`${text}\nx`), /lebih dari 10.000/);
});

test('batas 200 kolom diterapkan', () => {
    const headers = Array.from({ length: MAX_COLUMNS }, (_, i) => `K${i}`);
    assert.equal(parseCSV(headers.join(',')).headers.length, MAX_COLUMNS);
    assert.throws(() => parseCSV([...headers, 'Lebih'].join(',')), /200 kolom/);
});

test('HTML, script, dan formula disimpan sebagai teks tanpa transformasi', () => {
    const result = parseCSV('Isi\n"<script>alert(1)</script>"\n"=SUM(1,2)"');
    assert.deepEqual(result.rows, [['<script>alert(1)</script>'], ['=SUM(1,2)']]);
});

test('kombinasi nilai berkutip dapat dipulihkan persis melalui kedua delimiter', () => {
    const choices = ['', 'Ayu', 'a,b', 'a;b', '"kutip"', 'baris\nbaru', 'CR\r\nLF', '  spasi  ', '👋'];
    const headers = ['Nama', 'Catatan, utama', 'Kolom; tambahan'];
    const rows = Array.from({ length: 81 }, (_, i) => [choices[i % 9], choices[Math.floor(i / 9)], choices[(i * 7) % 9]]);
    for (const delimiter of [',', ';']) {
        const encode = row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(delimiter);
        const text = '\uFEFF' + [headers, ...rows].map(encode).join('\r\n');
        assert.deepEqual(parseCSV(text).rows, rows);
    }
});
