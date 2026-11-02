import { parseCSV } from './csv-parser.js';
import { bindFileInput, readCSVFile } from './file-input.js';
import { paginate, selectRows } from './table-model.js';
import { renderTable } from './table-view.js';

let passed = 0, failed = 0;
const check = (condition, message) => { if (!condition) throw new Error(message); };
const test = async (name, run) => {
    const item = document.createElement('li');
    try { await run(); passed++; item.textContent = `LULUS — ${name}`; }
    catch (error) { failed++; item.textContent = `GAGAL — ${name}: ${error.message}`; }
    document.querySelector('#results').append(item);
};
const file = new File(['\uFEFFNama;Catatan\r\nAyu;"Baris 1\nBaris 2"'], 'contoh.csv', { type: 'text/csv' });
await test('File API, BOM, titik koma, dan sel multibaris', async () => {
    const parsed = parseCSV(await readCSVFile(file));
    check(parsed.headers[0] === 'Nama' && parsed.delimiter === ';' && parsed.rows[0][1] === 'Baris 1\nBaris 2', 'Pembacaan CSV tidak cocok.');
});
await test('Tabel tidak mengeksekusi HTML pada header atau sel', async () => {
    const data = parseCSV('<b>Nama</b>,Catatan\nAyu,<script>alert(1)</script>');
    renderTable(data, [0], { column: null, direction: 'asc' }, () => {});
    const table = document.querySelector('#data-table');
    check(table.querySelectorAll('b,script,img,iframe').length === 0, 'Data dirender sebagai HTML.');
    check(table.textContent.includes('<script>alert(1)</script>'), 'Isi teks berubah.');
});
await test('Hanya 25 baris data dirender dan header dapat mengirim aksi sort', async () => {
    const data = parseCSV(`Nomor,Nama\n${Array.from({ length: 58 }, (_, i) => `${i + 1},Nama ${i + 1}`).join('\n')}`);
    const result = paginate(selectRows(data.rows), 1);
    let clicked = null;
    renderTable(data, result.visible, { column: null, direction: 'asc' }, index => { clicked = index; });
    check(document.querySelector('#table-body').rows.length === 25, 'Seluruh baris dirender sekaligus.');
    document.querySelector('#table-head button').click();
    check(clicked === 0, 'Aksi header tidak diteruskan.');
});
await test('Encoding yang tidak didukung ditolak pada browser', async () => {
    let rejected = false;
    try { await readCSVFile(new File([new Uint8Array([0xff, 0xfe, 0x41, 0])], 'salah.csv')); }
    catch (error) { rejected = error.message.includes('UTF-8'); }
    check(rejected, 'Encoding tidak valid diterima.');
});
const zone = document.createElement('div'), input = document.createElement('input'), choose = document.createElement('button');
input.type = 'file';
let selected = null, message = '';
bindFileInput({ choose, input, dropzone: zone, onFile: value => { selected = value; }, onError: value => { message = value; } });
const transfer = new DataTransfer(); transfer.items.add(file);
await test('Drag-and-drop satu CSV diterima dan diparsing', async () => {
    const event = new DragEvent('drop', { cancelable: true, dataTransfer: transfer });
    zone.dispatchEvent(event);
    check(event.defaultPrevented && selected, 'Drop tidak diterima.');
    check(parseCSV(await readCSVFile(selected)).rows.length === 1, 'Data dari drop salah.');
});
await test('Drop beberapa file ditolak', async () => {
    transfer.items.add(new File(['A\n1'], 'kedua.csv')); selected = null;
    zone.dispatchEvent(new DragEvent('drop', { cancelable: true, dataTransfer: transfer }));
    check(!selected && message.includes('satu file'), 'Beberapa file tidak ditolak.');
});
document.querySelector('#summary').textContent = `${passed} lulus, ${failed} gagal.`;
