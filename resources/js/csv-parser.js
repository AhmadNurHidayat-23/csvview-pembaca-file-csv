export const MAX_ROWS = 10_000;
export const MAX_COLUMNS = 200;

export function detectDelimiter(text) {
    const counts = { ',': 0, ';': 0 };
    let quoted = false, touched = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            touched = true;
            if (quoted && text[i + 1] === '"') { i++; continue; }
            quoted = !quoted;
        } else if (!quoted) {
            if (char === '\r' || char === '\n') { if (touched) break; continue; }
            if (char.trim()) touched = true;
            if (char in counts) counts[char]++;
        }
    }
    return counts[';'] > counts[','] ? ';' : ',';
}

export function parseCSV(source, choice = 'auto') {
    const text = source.replace(/^\uFEFF/, '');
    if (!text.trim()) throw new Error('File CSV kosong atau tidak memiliki header.');
    if (text.includes('\0')) throw new Error('File bukan teks UTF-8 yang didukung. Simpan ulang sebagai CSV UTF-8.');
    const delimiter = choice === 'auto' ? detectDelimiter(text) : choice;
    if (![',', ';'].includes(delimiter)) throw new Error('Pilih pemisah koma atau titik koma.');
    let headers = null, row = [], field = '', state = 'start', touched = false;
    const rows = [];
    const finishField = () => {
        row.push(field);
        if (row.length > MAX_COLUMNS) throw new Error('File memiliki lebih dari 200 kolom. Tidak ada data yang dimuat.');
        field = ''; state = 'start';
    };
    const finishRow = () => {
        if (!touched && !row.length && !field.length) return;
        finishField();
        if (headers === null) headers = row.map((value, index) => value.trim() ? value : `Kolom ${index + 1}`);
        else {
            if (row.length !== headers.length) throw new Error(`Jumlah kolom pada baris data ${rows.length + 1} berbeda dari header (${headers.length} kolom). Periksa pemisah dan tanda kutip.`);
            if (rows.length >= MAX_ROWS) throw new Error('File memiliki lebih dari 10.000 baris data. Tidak ada data yang dimuat.');
            rows.push(row);
        }
        row = []; field = ''; state = 'start'; touched = false;
    };
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (state === 'quoted') {
            if (char === '"') {
                if (text[i + 1] === '"') { field += '"'; i++; }
                else state = 'after-quote';
            } else field += char;
            continue;
        }
        if (char === delimiter) { finishField(); touched = true; continue; }
        if (char === '\r' || char === '\n') {
            finishRow();
            if (char === '\r' && text[i + 1] === '\n') i++;
            continue;
        }
        if (state === 'after-quote') {
            if (char === ' ' || char === '\t') continue;
            throw new Error('Format CSV tidak valid: ada karakter setelah tanda kutip penutup.');
        }
        touched = true;
        if (char === '"') {
            if (state !== 'start') throw new Error('Format CSV tidak valid: tanda kutip harus berada di awal sel.');
            state = 'quoted';
        } else { field += char; state = 'unquoted'; }
    }
    if (state === 'quoted') throw new Error('Format CSV tidak valid: tanda kutip belum ditutup.');
    finishRow();
    return { headers, rows, delimiter };
}
