async function csvToJson(url) {
    const response = await fetch(url + "&cache=" + Math.random());
    const text = await response.text();
    
    const rows = text.split('\n').filter(row => row.trim() !== '');
    const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        let obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] || "";
        });
        return obj;
    });
}
