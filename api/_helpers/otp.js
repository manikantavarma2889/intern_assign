import crypto from 'crypto';

export function generateOtp() {
  // 6-digit numeric, zero-padded, cryptographically random
  const n = crypto.randomInt(0, 1000000);
  return String(n).padStart(6, '0');
}

export function hashOtp(otp) {
  // OTPs live for 5 min; SHA-256 (with pepper) is standard for short-lived codes
  const pepper = process.env.OTP_PEPPER || 'secureauth-otp-pepper-v1';
  return crypto.createHash('sha256').update(`${otp}:${pepper}`).digest('hex');
}

export function timingSafeEqualStr(a, b) {
  const ba = Buffer.from(a || '', 'hex');
  const bb = Buffer.from(b || '', 'hex');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const visible = Math.min(2, Math.max(1, Math.floor(local.length / 4)));
  return `${local.slice(0, visible)}${'*'.repeat(Math.max(3, local.length - visible))}@${domain}`;
}
