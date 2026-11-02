import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate, selectRows } from '../../resources/js/table-model.js';

test('pencarian meliputi seluruh kolom tanpa membedakan kapitalisasi', () => {
    const rows = [['Ayu', 'Bandung'], ['Bima', 'Jakarta'], ['DINA', 'bandung']];
    assert.deepEqual(selectRows(rows, { query: ' BANDUNG ' }), [0, 2]);
    assert.deepEqual(selectRows(rows, { query: 'dina' }), [2]);
    assert.deepEqual(selectRows(rows, { query: 'tidak ada' }), []);
});

test('angka negatif, desimal, dan eksponen diurutkan numerik dua arah', () => {
    const rows = [['10'], ['2'], ['-3.5'], ['1e2'], ['']];
    assert.deepEqual(selectRows(rows, { column: 0 }), [2, 1, 0, 3, 4]);
    assert.deepEqual(selectRows(rows, { column: 0, direction: 'desc' }), [3, 0, 1, 2, 4]);
});

test('teks diurutkan secara wajar dan nilai setara tetap stabil', () => {
    const rows = [['Produk 10'], ['apel'], ['Produk 2'], ['APEL'], ['']];
    assert.deepEqual(selectRows(rows, { column: 0 }), [1, 3, 2, 0, 4]);
});

test('pencarian dan sorting tidak mengubah data atau nomor baris asli', () => {
    const rows = Object.freeze([Object.freeze(['B', '2']), Object.freeze(['A', '1'])]);
    assert.deepEqual(selectRows(rows, { query: 'a', column: 1 }), [1]);
    assert.deepEqual(selectRows(rows, { column: 0 }), [1, 0]);
    assert.deepEqual(rows, [['B', '2'], ['A', '1']]);
});

test('pagination default membatasi render menjadi 25 baris', () => {
    const indices = Array.from({ length: 58 }, (_, i) => i);
    const first = paginate(indices, 1), last = paginate(indices, 3);
    assert.equal(first.visible.length, 25);
    assert.deepEqual([first.from, first.to, first.pages], [1, 25, 3]);
    assert.deepEqual([last.from, last.to, last.visible.length], [51, 58, 8]);
    assert.equal(paginate(indices, 999).page, 3);
    assert.equal(paginate(indices, 0).page, 1);
});

test('pagination hasil pencarian dan data kosong selalu berada pada halaman valid', () => {
    assert.equal(paginate([6], 3).page, 1);
    assert.deepEqual(paginate([], 9), { page: 1, pages: 1, visible: [], from: 0, to: 0, total: 0 });
});
