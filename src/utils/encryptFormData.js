// utils/encryptFormData.js

import { encryptData } from "./cryptoUtils";


export const encryptFormData = (formData) => {
  const newFormData = new FormData();

  for (const [key, value] of formData.entries()) {

    // ✅ Skip encryption for files
    if (value instanceof File) {
      newFormData.append(key, value);
      continue;
    }

    // ✅ Skip encryption for IDs (UUID fields)
    if (key.toLowerCase().includes("id")) {
      newFormData.append(key, value);
      continue;
    }

    // ✅ Encrypt only normal text fields
    const encryptedValue = encryptData(value);
    newFormData.append(key, encryptedValue);
  }

  return newFormData;
};