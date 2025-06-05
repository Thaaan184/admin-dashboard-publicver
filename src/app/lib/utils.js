import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export const generateQRWithLogo = async (deviceId) => {
  if (typeof window === 'undefined') return null; // Skip on server
  try {
    const qrCanvas = document.createElement('canvas');
    const ctx = qrCanvas.getContext('2d');

    const qrSize = 200;
    await QRCode.toCanvas(qrCanvas, deviceId, {
      width: qrSize,
      height: qrSize,
      margin: 1,
    });

    const logo = new Image();
    logo.src = '/Logo-Kemhan.png';

    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = () => reject(new Error('Failed to load logo image'));
    });

    const logoSize = 40;
    const x = (qrSize - logoSize) / 2;
    const y = (qrSize - logoSize) / 2;
    ctx.drawImage(logo, x, y, logoSize, logoSize);

    return qrCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export async function generateBulkQRPDF(devices) {
  if (typeof window === 'undefined') return; // Skip on server
  const pdf = new jsPDF();
  const qrSize = 50;
  const paddingX = 20;
  const paddingY = 30;
  const startX = 20;
  const startY = 20;
  const itemsPerRow = 3;
  const pageHeight = pdf.internal.pageSize.getHeight();

  let x = startX;
  let y = startY;
  let count = 0;

  const logo = new Image();
  logo.src = '/Logo-Kemhan.png';
  await new Promise((resolve, reject) => {
    logo.onload = resolve;
    logo.onerror = () => reject(new Error('Failed to load logo image'));
  });

  for (const device of devices) {
    const qrCanvas = document.createElement('canvas');
    const ctx = qrCanvas.getContext('2d');
    qrCanvas.width = 200;
    qrCanvas.height = 200;
    await QRCode.toCanvas(qrCanvas, device.id, {
      width: 200,
      height: 200,
      margin: 1,
    });

    const logoSize = 40;
    const logoX = (qrCanvas.width - logoSize) / 2;
    const logoY = (qrCanvas.height - logoSize) / 2;
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

    const qrDataUrl = qrCanvas.toDataURL('image/png');

    pdf.addImage(qrDataUrl, 'PNG', x, y, qrSize, qrSize);

    pdf.setFontSize(10);
    pdf.text(device.name, x + qrSize / 2, y + qrSize + 7, { align: 'center' });

    count++;
    if (count % itemsPerRow === 0) {
      x = startX;
      y += qrSize + paddingY;
      if (y + qrSize + 20 > pageHeight) {
        pdf.addPage();
        x = startX;
        y = startY;
      }
    } else {
      x += qrSize + paddingX;
    }
  }

  pdf.save('bulk-qr-codes.pdf');
}