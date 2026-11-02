function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
}

export function renderTable(dataset, visible, sort, onSort) {
    const headerRow = element('tr');
    const numberHeader = element('th', 'Baris', 'row-number');
    numberHeader.scope = 'col';
    headerRow.append(numberHeader);
    dataset.headers.forEach((name, index) => {
        const th = element('th'); th.scope = 'col';
        const active = sort.column === index;
        th.setAttribute('aria-sort', active ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none');
        const button = element('button', undefined, 'column-button');
        button.type = 'button';
        button.setAttribute('aria-label', `Urutkan ${name}, kolom ${index + 1}, ${active && sort.direction === 'asc' ? 'menurun' : 'menaik'}`);
        button.append(element('span', name));
        const icon = element('span', active ? sort.direction === 'asc' ? '↑' : '↓' : '↕', 'sort-icon');
        icon.setAttribute('aria-hidden', 'true'); button.append(icon);
        button.addEventListener('click', () => onSort(index));
        th.append(button); headerRow.append(th);
    });
    document.getElementById('table-head').replaceChildren(headerRow);
    const body = document.createDocumentFragment();
    for (const index of visible) {
        const tr = element('tr');
        tr.append(element('td', String(index + 1), 'row-number'));
        for (const value of dataset.rows[index]) {
            const td = element('td');
            td.append(element('div', value, 'cell-value')); tr.append(td);
        }
        body.append(tr);
    }
    document.getElementById('table-body').replaceChildren(body);
}
