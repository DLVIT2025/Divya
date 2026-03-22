// Wrapper for QRCode Library

export const generateQR = (dataString) => {
    const qrContainer = document.getElementById("qrcode");
    
    // Clear previous QR
    qrContainer.innerHTML = '';
    
    // Generate new QR using the global QRCode class from CDN
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
            text: dataString,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    } else {
        console.error("QRCode library not loaded.");
        qrContainer.innerHTML = '<div class="text-muted">QR Error</div>';
    }
};
