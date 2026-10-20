// Password hashing using Node's built-in scrypt. No external deps.
// Stored format: `scrypt$<saltHex>$<hashHex>`

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;
const SALT_BYTES = 16;
const PREFIX = "scrypt";

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const hash = scryptSync(password, salt, KEYLEN);
  return `${PREFIX}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !stored.startsWith(`${PREFIX}$`)) {
    return false;
  }
  const [, saltHex, hashHex] = stored.split("$");
  if (!saltHex || !hashHex) return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * Short, non-reversible stand-in for a stored hash. Embedded in signed tokens (sessions,
 * password resets) so that changing the password invalidates everything issued before it —
 * that is what makes revocation and single-use work without a server-side session table.
 */
export function passwordFingerprint(storedHash: string): string {
  return createHash("sha256").update(storedHash).digest("hex").slice(0, 32);
}
