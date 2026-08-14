const crypto = require("crypto");
const QRCode = require("qrcode");

/** Generate a unique verification code for a product batch. */
function generateVerificationCode(batchNumber) {
  const random = crypto.randomBytes(4).toString("hex");
  return `FD-${batchNumber}-${random}`.toUpperCase();
}

/** Generate a QR code as a base64 data URL encoding the verification code. */
async function generateQRDataUrl(verificationCode) {
  return QRCode.toDataURL(verificationCode, { errorCorrectionLevel: "H", margin: 1, width: 300 });
}

module.exports = { generateVerificationCode, generateQRDataUrl };
