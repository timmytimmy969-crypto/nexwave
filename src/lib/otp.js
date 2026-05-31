import { Resend } from "resend";

const otpStore = globalThis.__nexwaveOtpStore || new Map();
const rateStore = globalThis.__nexwaveRateStore || new Map();
globalThis.__nexwaveOtpStore = otpStore;
globalThis.__nexwaveRateStore = rateStore;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function canRequestOtp(email, ip) {
  const key = `${ip}:${email}`;
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const entry = rateStore.get(key) || { count: 0, starts: now };

  if (now - entry.starts > windowMs) {
    rateStore.set(key, { count: 1, starts: now });
    return true;
  }

  if (entry.count >= 3) return false;
  entry.count += 1;
  rateStore.set(key, entry);
  return true;
}

export function createOtp(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(email, { code, expires: Date.now() + 10 * 60 * 1000, attempts: 0 });
  return code;
}

export function consumeOtp(email, code) {
  const entry = otpStore.get(email);
  if (!entry || Date.now() > entry.expires) return false;
  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpStore.delete(email);
    return false;
  }
  if (entry.code !== code) return false;
  otpStore.delete(email);
  return true;
}

export async function sendOtpEmail(email, code, name) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[NEXWAVE OTP] ${email}: ${code}`);
    return { demo: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: process.env.EMAIL_FROM || "Nexwave <welcome@nexwave.community>",
    to: email,
    subject: "Your Nexwave verification code",
    html: `<div style="font-family:Arial,sans-serif;background:#080705;color:#f7f2e9;padding:32px"><p style="letter-spacing:.28em;text-transform:uppercase;color:#c79a3d">NEXWAVE</p><h1 style="font-size:28px;margin:0 0 16px">Welcome${name ? `, ${name}` : ""}.</h1><p>Your one-time verification code is:</p><p style="font-size:36px;letter-spacing:.3em;color:#d7aa45">${code}</p><p>This code expires in 10 minutes.</p></div>`
  });
}

export async function sendWelcomeEmail(email, name) {
  if (!process.env.RESEND_API_KEY) return { demo: true };

  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: process.env.EMAIL_FROM || "Nexwave <welcome@nexwave.community>",
    to: email,
    subject: "Welcome to Nexwave - The First Wave starts here",
    html: `<div style="font-family:Arial,sans-serif;background:#080705;color:#f7f2e9;padding:32px"><p style="color:#c79a3d;margin:0 0 20px;text-transform:uppercase">NEXWAVE</p><h1 style="font-size:30px;margin:0 0 16px">Welcome${name ? `, ${name}` : ""}.</h1><p style="line-height:1.7;color:#d8cfbf">You are now part of Nexwave, a creative movement built for creators, actors, filmmakers, storytellers and young visionaries who are ready to grow together.</p><p style="line-height:1.7;color:#d8cfbf">The First Wave starts here. Create. Connect. Elevate.</p><a href="https://chat.whatsapp.com/FZSJW6vCjr48HhYmbkRFNr" style="display:inline-block;margin-top:18px;background:#d7aa45;color:#080705;padding:14px 18px;text-decoration:none;border-radius:6px;font-weight:bold">Enter the WhatsApp group</a></div>`
  });
}

export async function addResendContact(member) {
  if (!process.env.RESEND_API_KEY) return { demo: true };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const [firstName, ...rest] = String(member.full_name || "").trim().split(/\s+/);

  return resend.contacts.create({
    email: member.email,
    firstName: firstName || undefined,
    lastName: rest.join(" ") || undefined,
    unsubscribed: false,
    properties: {
      instagram: member.instagram || "",
      creative_field: member.creative_field || ""
    }
  });
}
