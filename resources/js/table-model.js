export const PAGE_SIZE = 25;
const collator = new Intl.Collator('id', { numeric: true, sensitivity: 'base' });
const numericPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function selectRows(rows, { query = '', column = null, direction = 'asc' } = {}) {
    const term = query.trim().toLowerCase();
    const indices = [];
    rows.forEach((row, index) => {
        if (!term || row.some(value => value.toLowerCase().includes(term))) indices.push(index);
    });
    if (column === null) return indices;
    let foundNumber = false;
    const numeric = rows.every(row => {
        const value = row[column].trim();
        if (!value) return true;
        foundNumber = true;
        return numericPattern.test(value) && Number.isFinite(Number(value));
    }) && foundNumber;
    indices.sort((left, right) => {
        const a = rows[left][column].trim(), b = rows[right][column].trim();
        if (!a || !b) return !a && !b ? left - right : !a ? 1 : -1;
        const difference = numeric ? Number(a) - Number(b) : collator.compare(a, b);
        return difference ? difference * (direction === 'desc' ? -1 : 1) : left - right;
    });
    return indices;
}

export function paginate(indices, requestedPage, pageSize = PAGE_SIZE) {
    const pages = Math.max(1, Math.ceil(indices.length / pageSize));
    const page = Math.min(pages, Math.max(1, Math.trunc(requestedPage) || 1));
    const start = (page - 1) * pageSize;
    return { page, pages, visible: indices.slice(start, start + pageSize), from: indices.length ? start + 1 : 0, to: Math.min(start + pageSize, indices.length), total: indices.length };
}
