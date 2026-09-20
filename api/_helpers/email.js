// Email sender supporting both Gmail SMTP (sends to any recipient) and Resend.
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

function getEnvVar(key) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)$`, 'm'));
      if (match) return match[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch {}
  return process.env[key];
}

export async function sendOtpEmail({ to, name, otp, purpose }) {
  const subject =
    purpose === 'password_reset'
      ? 'Reset your SecureAuth password'
      : 'Verify your SecureAuth account';

  const intro =
    purpose === 'password_reset'
      ? 'Use the code below to reset your SecureAuth password.'
      : 'Use the code below to verify your SecureAuth account.';

  const text = `Hi ${name || 'there'},\n\n${intro}\n\n${otp}\n\nThis code expires in 5 minutes.\n\nIf you didn't request this, you can safely ignore this email.\n\n— SecureAuth Team`;

  const html = `
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#0a0f0d;padding:32px;color:#e8e6e0">
      <div style="max-width:480px;margin:0 auto;background:#111815;border:1px solid #1f2a24;border-radius:16px;padding:32px">
        <div style="font-family:'Instrument Serif',Georgia,serif;font-size:28px;color:#e8b05c;margin-bottom:8px">SecureAuth</div>
        <div style="color:#7a8580;font-size:13px;margin-bottom:24px">${subject}</div>
        <p style="font-size:15px;line-height:1.6">Hi ${name || 'there'},</p>
        <p style="font-size:15px;line-height:1.6;color:#c9c7c1">${intro}</p>
        <div style="font-size:32px;letter-spacing:12px;text-align:center;padding:24px;background:#0a0f0d;border-radius:12px;color:#e8b05c;margin:24px 0;font-weight:600">${otp}</div>
        <p style="font-size:13px;color:#7a8580">This code expires in 5 minutes.</p>
        <p style="font-size:13px;color:#7a8580">If you didn't request this, you can safely ignore this email.</p>
        <div style="border-top:1px solid #1f2a24;margin-top:24px;padding-top:16px;color:#7a8580;font-size:12px">— SecureAuth Team</div>
      </div>
    </div>`;

  const smtpUser = getEnvVar('SMTP_USER') || getEnvVar('GMAIL_USER');
  const smtpPass = getEnvVar('SMTP_PASS') || getEnvVar('GMAIL_APP_PASSWORD');

  // Option 1: Gmail SMTP (No custom domain required, can send to ANY email)
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ''), // clean any accidental spaces in app password
        },
      });

      await transporter.sendMail({
        from: `SecureAuth <${smtpUser}>`,
        to,
        subject,
        text,
        html,
      });

      return { sent: true };
    } catch (err) {
      console.error('Gmail SMTP error:', err);
      return { sent: false, error: err?.message || 'Failed to send email via Gmail SMTP' };
    }
  }

  // Option 2: Resend
  const resendApiKey = getEnvVar('RESEND_API_KEY');
  if (!resendApiKey) {
    return { sent: false, error: 'No email provider configured. Please set SMTP_USER/SMTP_PASS or RESEND_API_KEY in .env' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getEnvVar('RESEND_FROM') || 'SecureAuth <onboarding@resend.dev>',
        to,
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        errorMsg = parsed.message || errText;
      } catch {}
      console.error('Resend error:', errorMsg);
      return { sent: false, error: errorMsg };
    }
    return { sent: true };
  } catch (err) {
    console.error('Resend email send failed:', err);
    return { sent: false, error: err?.message || 'Network error sending email' };
  }
}
