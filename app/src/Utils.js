export const generateCsv = (result) => {
    const csv = result.data.map(row => row.join(";"));
    return [result.cols.join(";"), ...csv].join("\n");
}

export const downloadCSV = (data) => {
    const csv = generateCsv(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}