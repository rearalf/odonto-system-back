import PDFDocument from 'pdfkit';

type PDFDoc = InstanceType<typeof PDFDocument>;

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
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    buildPdf(doc, data);
    doc.end();
  });
}

function buildPdf(doc: PDFDoc, data: RadiographyReportData): void {
  const options = [
    { key: 'periapical', label: 'Periapical' },
    { key: 'panoramic', label: 'Panorámica' },
    { key: 'bitewing', label: 'Bitewing (alas de mordida)' },
    { key: 'occlusal', label: 'Oclusal' },
    { key: 'cephalometric', label: 'Cephalométrica' },
    { key: 'cbct', label: 'Tomografía CBCT / TAC dental' },
  ];

  doc.fontSize(20).fillColor('#2c3e50').text('Reporte de Radiografías Odontológicas', {
    align: 'center',
  });
  doc.moveDown();
  doc.fontSize(12).fillColor('#7f8c8d').text('Clínica Dental', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).fillColor('#2c3e50').text('Datos del paciente', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#333333');
  doc.text(`Nombre completo: ${data.fullName}`);
  doc.text(`Edad: ${data.age} años`);
  doc.text(`Teléfono: ${data.phone}`);
  doc.moveDown(1);

  doc.fontSize(12).fillColor('#2c3e50').text('Radiografías solicitadas', { underline: true });
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const colX = 50;
  const checkX = 400;

  doc.fontSize(10).fillColor('#333333');
  options.forEach((option, index) => {
    const y = tableTop + index * 20;
    doc.text(option.label, colX, y);
    const isChecked = data.radiographs[option.key as keyof typeof data.radiographs];
    doc.fontSize(10).fillColor(isChecked ? '#27ae60' : '#95a5a6').text(isChecked ? 'Sí' : 'No', checkX, y);
    doc.fillColor('#333333');
  });

  doc.moveDown(options.length + 1);

  doc.fontSize(8).fillColor('#7f8c8d').text('Reporte generado automáticamente por el sistema odontológico.', {
    align: 'center',
  });
}
