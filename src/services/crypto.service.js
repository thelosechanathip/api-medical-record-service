const CryptoJS = require('crypto-js');

// เข้ารหัส
function cryptoEncode(data) {
  const key = process.env.SECRET_KEY;
  if (!key) throw new Error('SECRET_KEY is missing');

  const msg = (typeof data === 'object') ? JSON.stringify(data) : String(data ?? '');
  return CryptoJS.AES.encrypt(msg, key).toString(); // base64
}

// ถอดรหัส
function cryptoDecode(ciphertext) {
  const key = process.env.SECRET_KEY;
  if (!key) throw new Error('SECRET_KEY is missing');

  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const text = bytes.toString(CryptoJS.enc.Utf8);
  try { return JSON.parse(text); } catch { return text; }
}

module.exports = { cryptoEncode, cryptoDecode };