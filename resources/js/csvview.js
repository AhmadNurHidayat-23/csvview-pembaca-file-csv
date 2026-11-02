import { parseCSV } from './csv-parser.js';
import { bindFileInput, formatSize, readCSVFile, validateCSVFile } from './file-input.js';
import { paginate, selectRows } from './table-model.js';
import { renderTable } from './table-view.js';

const byId = id => document.getElementById(id);
const choose = byId('choose-button'), reset = byId('reset-button'), input = byId('file-input');
const area = byId('file-area'), search = byId('search-input'), delimiter = byId('delimiter-input');
const supported = typeof TextDecoder === 'function' && typeof globalThis.File?.prototype?.arrayBuffer === 'function';
let dataset = null, fileText = '', generation = 0, busy = false, page = 1, timer;
let sort = { column: null, direction: 'asc' };
const number = value => value.toLocaleString('id-ID');

function showError(text = '') {
    byId('file-error').textContent = text;
    byId('file-error').hidden = !text;
}

function clearTable() {
    clearTimeout(timer);
    dataset = null; page = 1; sort = { column: null, direction: 'asc' };
    search.value = '';
    byId('viewer').hidden = true;
    byId('table-head').replaceChildren();
    byId('table-body').replaceChildren();
    byId('process-status').textContent = '';
    byId('previous-button').disabled = byId('next-button').disabled = true;
}

function resetState() {
    generation++; busy = false; fileText = '';
    input.value = ''; delimiter.value = 'auto';
    clearTable(); showError();
    area.classList.remove('has-file', 'is-dragging');
    area.setAttribute('aria-busy', 'false');
    byId('file-title').textContent = 'Mulai dengan file CSV Anda.';
    byId('file-details').textContent = '';
    byId('file-details').hidden = true;
    byId('file-hint').hidden = byId('file-icon').hidden = false;
    byId('delimiter-control').hidden = true;
    delimiter.disabled = false;
    choose.hidden = false; choose.disabled = !supported; reset.hidden = true;
}

function render() {
    if (!dataset) return;
    const indices = selectRows(dataset.rows, { query: search.value, ...sort });
    const result = paginate(indices, page);
    page = result.page;
    renderTable(dataset, result.visible, sort, column => {
        sort = { column, direction: sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc' };
        page = 1; render();
        byId('table-head').querySelectorAll('button')[column]?.focus({ preventScroll: true });
    });
    byId('result-count').textContent = `${number(result.total)} dari ${number(dataset.rows.length)} baris`;
    byId('page-summary').textContent = `Menampilkan ${number(result.from)}–${number(result.to)} dari ${number(result.total)} baris`;
    byId('page-label').textContent = `Halaman ${number(page)} dari ${number(result.pages)}`;
    byId('previous-button').disabled = page <= 1;
    byId('next-button').disabled = page >= result.pages;
    byId('empty-state').hidden = result.total > 0;
    byId('empty-state').textContent = dataset.rows.length ? 'Tidak ada data yang cocok dengan pencarian Anda.' : 'File ini hanya berisi header, belum ada baris data.';
    search.disabled = !dataset.rows.length;
    byId('table-scroll').scrollTop = 0;
}

function applyText() {
    clearTable(); showError();
    try {
        dataset = parseCSV(fileText, delimiter.value);
        byId('viewer').hidden = false;
        const separator = dataset.delimiter === ',' ? 'koma' : 'titik koma';
        byId('process-status').textContent = `${number(dataset.rows.length)} baris data · ${number(dataset.headers.length)} kolom · Pemisah ${separator}`;
        byId('table-scroll').scrollLeft = 0;
        render();
    } catch (error) { showError(error.message); }
}

async function selectFile(file) {
    if (!supported) { showError('Browser ini belum mendukung pembacaan CSV. Gunakan browser terbaru.'); return; }
    if (busy) { showError('Tunggu pembacaan selesai atau gunakan Pilih File Lain.'); return; }
    resetState();
    try { validateCSVFile(file); } catch (error) { showError(error.message); return; }
    const current = generation;
    busy = true; choose.hidden = true; reset.hidden = false;
    area.classList.add('has-file'); area.setAttribute('aria-busy', 'true');
    byId('file-icon').hidden = byId('file-hint').hidden = true;
    byId('file-title').textContent = file.name;
    byId('file-details').textContent = formatSize(file.size);
    byId('file-details').hidden = false;
    byId('delimiter-control').hidden = false; delimiter.disabled = true;
    byId('process-status').textContent = 'Membaca dan menyiapkan data CSV…';
    try {
        const text = await readCSVFile(file);
        if (current !== generation) return;
        fileText = text;
        applyText();
    } catch (error) {
        if (current === generation) { showError(error.message); byId('process-status').textContent = ''; }
    } finally {
        if (current === generation) { busy = false; delimiter.disabled = !fileText; area.setAttribute('aria-busy', 'false'); }
    }
}

bindFileInput({ choose, input, dropzone: area, onFile: selectFile, onError: showError });
reset.addEventListener('click', () => { resetState(); choose.focus(); });
delimiter.addEventListener('change', () => { if (fileText && !busy) applyText(); });
search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { page = 1; render(); }, 150);
});
byId('previous-button').addEventListener('click', () => { page--; render(); });
byId('next-button').addEventListener('click', () => { page++; render(); });
window.addEventListener('pagehide', resetState);
choose.disabled = !supported;
if (!supported) showError('Browser ini belum mendukung pembacaan CSV. Gunakan browser terbaru.');
