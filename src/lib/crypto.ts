import crypto from "crypto";

// Use a fallback for local development if NEXTAUTH_SECRET is not available
// In production, this MUST be a strong unique secret
const SECRET = process.env.NEXTAUTH_SECRET || "elkonmix_industrial_report_secret_key_v1";

/**
 * Generates a verification hash for a set of report parameters.
 * @param params Object containing report metadata (date, volume, type)
 * @returns A cryptographically secure HMAC signature
 */
export function signReport(params: Record<string, string | number>): string {
  const dataString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join("|");
  
  return crypto.createHmac("sha256", SECRET).update(dataString).digest("hex");
}

/**
 * Verifies if a given hash matches the parameters.
 * @param params The original parameters
 * @param hash The candidate signature to verify
 * @returns boolean
 */
export function verifyReport(params: Record<string, string | number>, hash: string): boolean {
  const expected = signReport(params);
  return expected === hash;
}
