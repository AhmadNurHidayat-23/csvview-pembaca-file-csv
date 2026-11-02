import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_FILE_SIZE, readCSVFile, validateCSVFile } from '../../resources/js/file-input.js';

test('file CSV UTF-8 dan ekstensi huruf besar dibaca', async () => {
    assert.equal(await readCSVFile(new File(['\uFEFFA,B\nAyu,👋'], 'data.CSV')), 'A,B\nAyu,👋');
});

test('format selain CSV dan file kosong ditolak', () => {
    assert.throws(() => validateCSVFile(new File(['A,B'], 'data.xlsx')), /ekstensi/);
    assert.throws(() => validateCSVFile(new File([], 'data.csv')), /kosong/);
});

test('10 MB diterima, kelebihan ukuran ditolak sebelum membaca data', async () => {
    let read = false;
    const file = { name: 'data.csv', size: MAX_FILE_SIZE + 1, arrayBuffer: async () => { read = true; } };
    await assert.rejects(readCSVFile(file), /10 MB/);
    assert.equal(read, false);
    assert.doesNotThrow(() => validateCSVFile({ ...file, size: MAX_FILE_SIZE }));
});

test('encoding Windows-1252 dan UTF-16 yang tidak didukung ditolak dengan pesan jelas', async () => {
    for (const bytes of [[0xe9], [0xff, 0xfe, 0x41, 0x00]]) {
        await assert.rejects(readCSVFile(new File([new Uint8Array(bytes)], 'data.csv')), /CSV UTF-8/);
    }
});

test('kegagalan pembacaan tidak membocorkan pesan sistem', async () => {
    const file = { name: 'data.csv', size: 10, arrayBuffer: async () => { throw new Error('private-path/error'); } };
    await assert.rejects(readCSVFile(file), { message: 'File gagal dibaca. Pastikan file masih tersedia lalu pilih kembali.' });
});
