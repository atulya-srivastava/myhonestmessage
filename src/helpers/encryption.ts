import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'default_secret_key_needs_replacement_32chars'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function getEncryptionKey() {
    // Ensure the key is 32 bytes. If it's a string, we might need to hash it or pad it.
    // For simplicity, we'll hash the env var to ensure 32 bytes.
    return crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
}

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    const textParts = text.split(':');
    if (textParts.length !== 2) {
        // Fallback for unencrypted text or invalid format
        return text;
    }
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
