import CryptoJS from "crypto-js";

const SECRET_KEY = "my-super-secret-key-123";

/* ================= ENCRYPT ================= */
export const encryptData = (data) => {
  try {
    const text =
      typeof data === "string"
        ? data
        : JSON.stringify(data);

    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.log("Encrypt Error:", error);
    return data;
  }
};


export const decryptData = (cipherText) => {
  try {
    // safety check
    if (!cipherText) return cipherText;

    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // if not encrypted or wrong key
    if (!decrypted) return cipherText;

    // ✅ SAFE JSON PARSE
    try {
      return JSON.parse(decrypted);
    } catch {
      // not JSON → return string
      return decrypted;
    }
  } catch (error) {
    console.log("Decrypt Error:", error);
    return cipherText;
  }
};


