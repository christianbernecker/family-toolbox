import * as CryptoJS from 'crypto-js';

export class EncryptionService {
  private static getKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }
    return key;
  }

  static encrypt(text: string): string {
    const key = this.getKey();
    return CryptoJS.AES.encrypt(text, key).toString();
  }

  static decrypt(ciphertext: string): string {
    const key = this.getKey();
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
} 