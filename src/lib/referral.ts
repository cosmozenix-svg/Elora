/**
 * Helper utilities for the Elora Referral System
 * Referral codes are 6-character uppercase alphanumeric strings (e.g. HG67UC).
 */

const REFERRAL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Numbers & Uppercase letters (excluding easily confused 0/O/1/I)

export function generateReferralCode(existingCodes: string[] = []): string {
  let code = '';
  let attempts = 0;
  
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += REFERRAL_CHARS.charAt(Math.floor(Math.random() * REFERRAL_CHARS.length));
    }
    attempts++;
  } while (existingCodes.includes(code) && attempts < 50);

  return code;
}

export function isValidReferralCodeFormat(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase();
  return /^[A-Z0-9]{5,8}$/.test(clean);
}
