export async function renderQRCode(container, payload) {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const QRCode = (await import('https://esm.sh/qrcode@1.5.3')).default;
  const dataUrl = await QRCode.toDataURL(text, {
    width: 220,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#0a0a0f', light: '#ffffff' },
  });
  container.innerHTML = '';
  const img = document.createElement('img');
  img.src = dataUrl;
  img.alt = 'Booking QR code';
  img.className = 'ticket-qr-img';
  img.width = 220;
  img.height = 220;
  container.appendChild(img);
}
