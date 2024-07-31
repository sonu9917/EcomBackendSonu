// utils/generateReferralCode.js
import crypto from 'crypto';

export function generateReferralCode() {
  return `${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}
