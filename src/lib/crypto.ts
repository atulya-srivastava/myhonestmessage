/**
 * Client-Side E2E Encryption Utilities
 * Uses Web Crypto API for RSA + AES hybrid encryption
 */

// Constants
const RSA_ALGORITHM = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

const AES_ALGORITHM = {
  name: 'AES-GCM',
  length: 256,
};

const PBKDF2_ITERATIONS = 100000;

// ============================================
// KEY GENERATION
// ============================================

/**
 * Generate RSA key pair for encryption
 */
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    RSA_ALGORITHM,
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export public key to JWK format for storage
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey('jwk', publicKey);
  return JSON.stringify(jwk);
}

/**
 * Import public key from JWK string
 */
export async function importPublicKey(jwkString: string): Promise<CryptoKey> {
  const jwk = JSON.parse(jwkString);
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    RSA_ALGORITHM,
    true,
    ['encrypt']
  );
}

/**
 * Export private key to JWK format
 */
export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey('jwk', privateKey);
  return JSON.stringify(jwk);
}

/**
 * Import private key from JWK string
 */
export async function importPrivateKey(jwkString: string): Promise<CryptoKey> {
  const jwk = JSON.parse(jwkString);
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    RSA_ALGORITHM,
    true,
    ['decrypt']
  );
}

// ============================================
// PASSWORD-BASED KEY WRAPPING
// ============================================

/**
 * Derive an AES key from password using PBKDF2
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    AES_ALGORITHM,
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Wrap (encrypt) private key with password
 * Returns: salt:iv:encryptedKey (all hex-encoded)
 */
export async function wrapPrivateKey(privateKey: CryptoKey, password: string): Promise<string> {
  const privateKeyJWK = await exportPrivateKey(privateKey);
  const encoder = new TextEncoder();
  const data = encoder.encode(privateKeyJWK);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key from password
  const wrappingKey = await deriveKeyFromPassword(password, salt);

  // Encrypt the private key
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    data
  );

  // Combine salt:iv:encrypted
  const saltHex = bufferToHex(salt);
  const ivHex = bufferToHex(iv);
  const encryptedHex = bufferToHex(new Uint8Array(encrypted));

  return `${saltHex}:${ivHex}:${encryptedHex}`;
}

/**
 * Unwrap (decrypt) private key with password
 */
export async function unwrapPrivateKey(wrappedKey: string, password: string): Promise<CryptoKey> {
  const parts = wrappedKey.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid wrapped key format');
  }

  const salt = hexToBuffer(parts[0]);
  const iv = hexToBuffer(parts[1]);
  const encrypted = hexToBuffer(parts[2]);

  // Derive key from password
  const unwrappingKey = await deriveKeyFromPassword(password, salt);

  // Decrypt the private key
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    unwrappingKey,
    encrypted.buffer as ArrayBuffer
  );

  const decoder = new TextDecoder();
  const privateKeyJWK = decoder.decode(decrypted);

  return await importPrivateKey(privateKeyJWK);
}

// ============================================
// RECOVERY CODE
// ============================================

/**
 * Generate a random recovery code (XXXX-XXXX-XXXX-XXXX format)
 */
export function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing chars: 0,O,I,1
  const segments = 4;
  const segmentLength = 4;
  const parts: string[] = [];

  for (let i = 0; i < segments; i++) {
    let segment = '';
    const randomValues = crypto.getRandomValues(new Uint8Array(segmentLength));
    for (let j = 0; j < segmentLength; j++) {
      segment += chars[randomValues[j] % chars.length];
    }
    parts.push(segment);
  }

  return parts.join('-');
}

// ============================================
// MESSAGE ENCRYPTION (Hybrid RSA + AES)
// ============================================

export interface EncryptedMessage {
  encryptedContent: string;   // AES-encrypted message (hex)
  encryptedAESKey: string;    // RSA-encrypted AES key (hex)
  iv: string;                  // IV for AES decryption (hex)
}

/**
 * Encrypt a message for a recipient using their public key
 * Uses hybrid encryption: AES for data, RSA for AES key
 */
export async function encryptMessage(
  message: string,
  recipientPublicKeyJWK: string
): Promise<EncryptedMessage> {
  // Import recipient's public key
  const publicKey = await importPublicKey(recipientPublicKeyJWK);

  // Generate random AES key for this message
  const aesKey = await crypto.subtle.generateKey(
    AES_ALGORITHM,
    true,
    ['encrypt', 'decrypt']
  );

  // Encrypt message with AES
  const encoder = new TextEncoder();
  const messageData = encoder.encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedMessage = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    messageData
  );

  // Export AES key and encrypt it with recipient's RSA public key
  const rawAESKey = await crypto.subtle.exportKey('raw', aesKey);     
  const encryptedAESKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAESKey
  );

  return {
    encryptedContent: bufferToHex(new Uint8Array(encryptedMessage)),
    encryptedAESKey: bufferToHex(new Uint8Array(encryptedAESKey)),
    iv: bufferToHex(iv),
  };
}

/**
 * Decrypt a message using the recipient's private key
 */
export async function decryptMessage(
  encryptedMessage: EncryptedMessage,
  privateKey: CryptoKey
): Promise<string> {
  // Decrypt the AES key using RSA private key
  const encryptedAESKeyBuffer = hexToBuffer(encryptedMessage.encryptedAESKey);
  const rawAESKey = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encryptedAESKeyBuffer.buffer as ArrayBuffer
  );

  // Import the AES key
  const aesKey = await crypto.subtle.importKey(
    'raw',
    rawAESKey,
    AES_ALGORITHM,
    false,
    ['decrypt']
  );

  // Decrypt the message content
  const iv = hexToBuffer(encryptedMessage.iv);
  const encryptedContent = hexToBuffer(encryptedMessage.encryptedContent);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    aesKey,
    encryptedContent.buffer as ArrayBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// ============================================
// INDEXEDDB KEY STORAGE
// ============================================

const DB_NAME = 'mhm-encryption';
const DB_VERSION = 1;
const STORE_NAME = 'keys';

/**
 * Get the storage key ID for a specific user
 */
function getKeyId(userId: string): string {
  return `private-key-${userId}`;
}

/**
 * Open the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Store the decrypted private key in IndexedDB for a specific user
 * Persists across page refreshes but cleared on browser close
 */
export async function storePrivateKey(privateKey: CryptoKey, userId: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.put({
      id: getKeyId(userId),
      key: privateKey,
      userId: userId,
      storedAt: Date.now(),
    });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Retrieve the private key from IndexedDB for a specific user
 * Returns null if not found
 */
export async function getStoredPrivateKey(userId: string): Promise<CryptoKey | null> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get(getKeyId(userId));
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.key : null);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to get stored private key:', error);
    return null;
  }
}

/**
 * Clear the stored private key for a specific user (for "Lock" functionality)
 */
export async function clearStoredPrivateKey(userId: string): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete(getKeyId(userId));
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to clear stored private key:', error);
  }
}
