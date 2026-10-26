import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const VERSION_PREFIX = "enc:v1:";

function getEncryptionKey(): Buffer {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "careerhub-secure-default-encryption-salt-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Securely encrypts an API key for storage in the database.
 * Returns authenticated ciphertext in format: enc:v1:<iv>:<tag>:<data>
 */
export function encryptApiKey(plainKey: string): string {
  const trimmed = plainKey.trim();
  if (!trimmed) return "";

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(trimmed, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${VERSION_PREFIX}${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a stored encrypted hash back to plaintext for outgoing LLM API requests.
 */
export function decryptApiKey(encryptedHash?: string | null): string | null {
  if (!encryptedHash || !encryptedHash.startsWith(VERSION_PREFIX)) {
    return null;
  }

  try {
    const payload = encryptedHash.slice(VERSION_PREFIX.length);
    const [ivHex, tagHex, cipherHex] = payload.split(":");
    if (!ivHex || !tagHex || !cipherHex) return null;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(cipherHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted.trim();
  } catch {
    return null;
  }
}

/**
 * Produces a secure masked preview of an API key (e.g. sk-a1••••••••b2c3)
 */
export function maskApiKey(plainKeyOrEncrypted?: string | null): string {
  if (!plainKeyOrEncrypted) return "";

  let keyToMask = plainKeyOrEncrypted;
  if (plainKeyOrEncrypted.startsWith(VERSION_PREFIX)) {
    const decrypted = decryptApiKey(plainKeyOrEncrypted);
    if (!decrypted) return "••••••••••••";
    keyToMask = decrypted;
  }

  if (keyToMask.length <= 8) {
    return "••••••••";
  }

  const prefix = keyToMask.slice(0, 4);
  const suffix = keyToMask.slice(-4);
  return `${prefix}••••••••${suffix}`;
}
