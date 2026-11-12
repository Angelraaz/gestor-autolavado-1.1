/**
 * Utility for exporting and printing inventory in Excel / Google Sheets format (.csv with UTF-8 BOM)
 * and triggering immediate downloads compatible with Microsoft Excel, LibreOffice, and Google Sheets.
 */

export function exportToExcelSheet(
  filename: string,
  sheetTitle: string,
  headers: string[],
  rows: (string | number)[][]
) {
  // Format rows with escaped quotes
  const formatCell = (val: string | number): string => {
    const text = String(val ?? '');
    if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes(';')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const csvContent = [
    `# ${sheetTitle} - SGAI (Sistema de Gestión Automotriz Interno)`,
    `# Fecha de exportación: ${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE')}`,
    '',
    headers.map(formatCell).join(','),
    ...rows.map((row) => row.map(formatCell).join(','))
  ].join('\r\n');

  // Add UTF-8 BOM (\uFEFF) so Excel opens UTF-8 accents and characters correctly without asking for encoding
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a clean printable Sheet view for printing on physical paper or saving to PDF
 */
export function printInventorySheet(
  sheetTitle: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Por favor permite ventanas emergentes para imprimir la hoja.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${sheetTitle} - SGAI</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 24px; color: #111; }
        .header { border-bottom: 2px solid #e11d48; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
        h1 { margin: 0; font-size: 18px; text-transform: uppercase; color: #111; }
        .meta { font-size: 11px; color: #666; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
        th { background: #f4f4f5; text-align: left; padding: 8px 10px; border: 1px solid #d4d4d8; font-weight: bold; text-transform: uppercase; font-size: 10px; }
        td { padding: 6px 10px; border: 1px solid #e4e4e7; }
        tr:nth-child(even) { background: #fafafa; }
        .num { text-align: right; font-family: monospace; font-size: 11px; }
        .footer { margin-top: 24px; border-top: 1px solid #ccc; padding-top: 8px; font-size: 10px; color: #888; display: flex; justify-content: space-between; }
        @media print {
          @page { margin: 12mm; }
          button { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${sheetTitle}</h1>
          <div class="meta">SGAI · Sistema de Gestión Automotriz Interno | Fecha: ${new Date().toLocaleDateString('es-VE')} - ${new Date().toLocaleTimeString('es-VE')}</div>
        </div>
        <button onclick="window.print()" style="padding: 6px 14px; background: #e11d48; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
          Imprimir Hoja
        </button>
      </div>
      <table>
        <thead>
          <tr>
            ${headers.map((h) => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              ${r.map((c, i) => `<td class="${typeof c === 'number' ? 'num' : ''}">${c}</td>`).join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div class="footer">
        <span>Generado por SGAI</span>
        <span>Página 1 de 1</span>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
