export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateCSVFile(file) {
    if (!file || !/\.csv$/i.test(file.name)) throw new Error('Pilih file dengan ekstensi .csv. Format XLSX atau TSV belum didukung.');
    if (!file.size) throw new Error('File CSV kosong. Pilih file yang berisi header dan data.');
    if (file.size > MAX_FILE_SIZE) throw new Error('Ukuran file melebihi 10 MB. Pilih file yang lebih kecil.');
}

export async function readCSVFile(file) {
    validateCSVFile(file);
    let buffer;
    try { buffer = await file.arrayBuffer(); }
    catch { throw new Error('File gagal dibaca. Pastikan file masih tersedia lalu pilih kembali.'); }
    try { return new TextDecoder('utf-8', { fatal: true }).decode(buffer); }
    catch { throw new Error('Encoding file tidak didukung. Simpan ulang sebagai CSV UTF-8.'); }
}

export function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    const megabytes = bytes >= 1024 * 1024;
    return `${(bytes / (megabytes ? 1024 * 1024 : 1024)).toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${megabytes ? 'MB' : 'KB'}`;
}

export function bindFileInput({ choose, input, dropzone, onFile, onError }) {
    choose.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
        const file = input.files[0]; input.value = '';
        if (file) onFile(file);
    });
    let depth = 0;
    for (const name of ['dragenter', 'dragover', 'dragleave', 'drop']) {
        window.addEventListener(name, event => {
            if (Array.from(event.dataTransfer?.types || []).includes('Files')) event.preventDefault();
        });
    }
    dropzone.addEventListener('dragenter', event => {
        event.preventDefault(); depth++; dropzone.classList.add('is-dragging');
    });
    dropzone.addEventListener('dragover', event => event.preventDefault());
    dropzone.addEventListener('dragleave', () => {
        if (--depth <= 0) dropzone.classList.remove('is-dragging');
    });
    dropzone.addEventListener('drop', event => {
        event.preventDefault(); depth = 0; dropzone.classList.remove('is-dragging');
        if (event.dataTransfer.files.length !== 1) { onError('Pilih satu file CSV saja.'); return; }
        onFile(event.dataTransfer.files[0]);
    });
}
