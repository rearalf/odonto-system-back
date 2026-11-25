import puppeteer from 'puppeteer';

export interface RadiographyReportData {
  fullName: string;
  age: number;
  phone: string;
  radiographs: {
    periapical: boolean;
    panoramic: boolean;
    bitewing: boolean;
    occlusal: boolean;
    cephalometric: boolean;
    cbct: boolean;
  };
}

export async function generateRadiographyReportPdf(
  data: RadiographyReportData,
): Promise<Buffer> {
  const html = buildHtml(data);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
  });
  await browser.close();

  return Buffer.from(pdfBuffer);
}

function buildHtml(data: RadiographyReportData): string {
  const options = [
    { key: 'periapical', label: 'Periapical' },
    { key: 'panoramic', label: 'Panorámica' },
    { key: 'bitewing', label: 'Bitewing (alas de mordida)' },
    { key: 'occlusal', label: 'Oclusal' },
    { key: 'cephalometric', label: 'Cephalométrica' },
    { key: 'cbct', label: 'Tomografía CBCT / TAC dental' },
  ];

  const rows = options
    .map(
      (o) => `
      <tr>
        <td style="text-align: left;">${o.label}</td>
        <td class="${data.radiographs[o.key as keyof typeof data.radiographs] ? 'checked' : 'unchecked'}">
          ${data.radiographs[o.key as keyof typeof data.radiographs] ? 'Sí' : 'No'}
        </td>
      </tr>
    `,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Reporte de Radiografías Odontológicas</title>
      <style>
        body { font-family: Arial, sans-serif; color: #333; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: bold; color: #2c3e50; margin: 0; }
        .subtitle { font-size: 14px; color: #7f8c8d; margin: 5px 0 0 0; }
        .patient-info { margin-bottom: 20px; }
        .patient-info table { width: 100%; border-collapse: collapse; }
        .patient-info td { padding: 6px 8px; border: 1px solid #bdc3c7; }
        .patient-info td.label { font-weight: bold; background: #ecf0f1; width: 30%; }
        .radiographs { margin-bottom: 20px; }
        .radiographs table { width: 100%; border-collapse: collapse; }
        .radiographs th { background: #2c3e50; color: #fff; padding: 8px; text-align: left; border: 1px solid #2c3e50; }
        .radiographs td { padding: 8px; border: 1px solid #bdc3c7; text-align: center; }
        .radiographs td.checked { color: #27ae60; font-weight: bold; }
        .radiographs td.unchecked { color: #95a5a6; }
        .footer { margin-top: 30px; border-top: 1px solid #bdc3c7; padding-top: 10px; font-size: 10px; color: #7f8c8d; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">Reporte de Radiografías Odontológicas</h1>
        <p class="subtitle">Clínica Dental</p>
      </div>

      <div class="patient-info">
        <table>
          <tr><td class="label">Nombre completo:</td><td>${escapeHtml(data.fullName)}</td></tr>
          <tr><td class="label">Edad:</td><td>${data.age} años</td></tr>
          <tr><td class="label">Teléfono:</td><td>${escapeHtml(data.phone)}</td></tr>
        </table>
      </div>

      <div class="radiographs">
        <table>
          <thead>
            <tr><th>Radiografía</th><th>Solicitada</th></tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Reporte generado automáticamente por el sistema odontológico.
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
