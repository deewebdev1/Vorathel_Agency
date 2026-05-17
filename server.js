// ═══════════════════════════════════════════════
//  VORATHEL AGENCY — Backend Server
//  Node.js + Express + Nodemailer
//  Sends contact form submissions to Gmail
// ═══════════════════════════════════════════════

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // set your domain in .env
  methods: ['POST', 'GET'],
}));

// Serve your frontend static files
app.use(express.static('public')); // put vorathel.html + logos in /public folder

// ── Rate Limiter (prevent spam) ───────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // max 5 submissions per IP per 15 mins
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// ── Nodemailer Transporter ────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER, // vorathelagency@gmail.com
    pass: process.env.GMAIL_PASS, // Gmail App Password (NOT your real password)
  },
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Mail transporter error:', error.message);
  } else {
    console.log('✅ Mail server ready — vorathelagency@gmail.com');
  }
});

// ── Input Validator ───────────────────────────
function validate(body) {
  const { name, email, phone, service, contact_method } = body;
  const errors = [];
  if (!name    || name.trim().length    < 2) errors.push('Name is required.');
  if (!email   || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required.');
  if (!phone   || phone.trim().length   < 7) errors.push('Phone number is required.');
  if (!service || service.trim().length < 2) errors.push('Please select a service.');
  if (!contact_method)                       errors.push('Please select a contact method.');
  return errors;
}

// ── HTML Email Template ───────────────────────
function buildEmailHTML({ name, email, phone, service, contact_method, message }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin:0; padding:0; background:#f4f4f4; font-family:'Segoe UI',sans-serif; }
  .wrap { max-width:600px; margin:40px auto; background:#ffffff; }
  .header { background:#020c07; padding:36px 40px; }
  .header-logo { font-size:22px; font-weight:700; color:#39ff88; letter-spacing:6px; text-transform:uppercase; }
  .header-sub  { font-size:12px; color:rgba(255,255,255,0.4); margin-top:4px; letter-spacing:2px; text-transform:uppercase; }
  .body { padding:40px; }
  .alert { background:#f0faf4; border-left:3px solid #065a2d; padding:16px 20px; margin-bottom:28px; }
  .alert p { margin:0; font-size:14px; color:#065a2d; font-weight:600; }
  .field { margin-bottom:20px; }
  .field-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#999; margin-bottom:4px; }
  .field-val   { font-size:14px; color:#111; background:#f9f9f9; padding:12px 14px; border-left:2px solid #e0e0e0; }
  .field-val.highlight { border-left-color:#065a2d; background:#f0faf4; color:#065a2d; font-weight:600; }
  .message-box { background:#f9f9f9; padding:20px; border:1px solid #ebebeb; font-size:14px; color:#444; line-height:1.7; margin-top:8px; }
  .footer { background:#020c07; padding:24px 40px; display:flex; align-items:center; justify-content:space-between; }
  .footer p { font-size:11px; color:rgba(255,255,255,0.3); margin:0; letter-spacing:1px; }
  .footer a { font-size:11px; color:#39ff88; text-decoration:none; }
  .divider { height:1px; background:#ebebeb; margin:24px 0; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-logo">Vorathel</div>
    <div class="header-sub">New Consultation Request</div>
  </div>
  <div class="body">
    <div class="alert">
      <p>🔔 A new client inquiry has been submitted through your website.</p>
    </div>

    <div class="field">
      <div class="field-label">Full Name / Business</div>
      <div class="field-val">${name}</div>
    </div>
    <div class="field">
      <div class="field-label">Email Address</div>
      <div class="field-val"><a href="mailto:${email}" style="color:#065a2d;">${email}</a></div>
    </div>
    <div class="field">
      <div class="field-label">Phone Number</div>
      <div class="field-val"><a href="tel:${phone}" style="color:#065a2d;">${phone}</a></div>
    </div>
    <div class="field">
      <div class="field-label">Service Requested</div>
      <div class="field-val highlight">${service}</div>
    </div>
    <div class="field">
      <div class="field-label">Preferred Contact Method</div>
      <div class="field-val">${contact_method}</div>
    </div>

    ${message ? `
    <div class="divider"></div>
    <div class="field">
      <div class="field-label">Project Details / Message</div>
      <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
    </div>` : ''}

    <div class="divider"></div>
    <p style="font-size:13px;color:#999;margin:0;">
      Reply directly to this email to respond to <strong>${name}</strong>,
      or use their preferred contact method above.
    </p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Vorathel Agency</p>
    <a href="mailto:vorathelagency@gmail.com">vorathelagency@gmail.com</a>
  </div>
</div>
</body>
</html>
  `;
}

// Auto-reply HTML to the client
function buildAutoReplyHTML({ name, service }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin:0; padding:0; background:#f4f4f4; font-family:'Segoe UI',sans-serif; }
  .wrap { max-width:600px; margin:40px auto; background:#ffffff; }
  .header { background:#020c07; padding:36px 40px; }
  .header-logo { font-size:22px; font-weight:700; color:#39ff88; letter-spacing:6px; text-transform:uppercase; }
  .header-tag  { font-size:11px; color:rgba(255,255,255,0.35); margin-top:4px; letter-spacing:2px; text-transform:uppercase; }
  .body { padding:40px; }
  .greeting { font-size:22px; font-weight:600; color:#020c07; margin-bottom:16px; }
  .body p { font-size:14px; color:#555; line-height:1.8; margin-bottom:16px; }
  .highlight { color:#065a2d; font-weight:600; }
  .steps { background:#f0faf4; border:1px solid rgba(6,90,45,0.15); padding:24px; margin:24px 0; }
  .step { display:flex; gap:14px; align-items:flex-start; margin-bottom:14px; }
  .step:last-child { margin-bottom:0; }
  .step-num { width:24px; height:24px; background:#065a2d; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
  .step-txt { font-size:13px; color:#333; line-height:1.6; }
  .cta-btn { display:inline-block; background:#065a2d; color:#fff; padding:14px 32px; text-decoration:none; font-size:13px; font-weight:600; letter-spacing:1px; text-transform:uppercase; margin:8px 0; }
  .footer { background:#020c07; padding:24px 40px; }
  .footer p { font-size:11px; color:rgba(255,255,255,0.3); margin:0 0 4px; }
  .footer a { color:#39ff88; text-decoration:none; font-size:11px; }
  .socials { display:flex; gap:16px; margin-top:12px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-logo">Vorathel</div>
    <div class="header-tag">Engineering Digital Excellence</div>
  </div>
  <div class="body">
    <div class="greeting">Hello, ${name} 👋</div>
    <p>
      Thank you for reaching out to <span class="highlight">Vorathel Agency</span>.
      We've received your consultation request for <span class="highlight">${service}</span>
      and we're excited to connect with you.
    </p>
    <p>Here's what happens next:</p>
    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-txt">Our team will review your request within <strong>24 hours</strong>.</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-txt">We'll reach out via your preferred contact method to schedule a discovery session.</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-txt">We'll provide a custom proposal aligned with your goals and budget.</div>
      </div>
    </div>
    <p>
      In the meantime, feel free to reach us directly via WhatsApp or email if you have
      any urgent questions.
    </p>
    <a href="https://wa.me/2347073743543?text=Hello%20Vorathel%20Agency" class="cta-btn">
      Chat on WhatsApp →
    </a>
    <p style="margin-top:24px;font-size:12px;color:#999;">
      This is an automated confirmation. Please do not reply to this email directly —
      our team will contact you separately.
    </p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Vorathel Agency. All rights reserved.</p>
    <a href="mailto:vorathelagency@gmail.com">vorathelagency@gmail.com</a>
    <div class="socials">
      <a href="https://www.instagram.com/vorathel_agency">Instagram</a>
      <a href="https://x.com/vorathelagency">X / Twitter</a>
      <a href="https://www.tiktok.com/@vorathel_agency">TikTok</a>
    </div>
  </div>
</div>
</body>
</html>
  `;
}

// ── POST /api/contact ─────────────────────────
app.post('/api/contact', limiter, async (req, res) => {
  const { name, email, phone, service, contact_method, message } = req.body;

  // Validate
  const errors = validate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    // 1. Email to Vorathel
    await transporter.sendMail({
      from:    `"Vorathel Website" <${process.env.GMAIL_USER}>`,
      to:      process.env.GMAIL_USER,          // vorathelagency@gmail.com
      replyTo: email,
      subject: `🔔 New Inquiry: ${service} — ${name}`,
      html:    buildEmailHTML({ name, email, phone, service, contact_method, message }),
    });

    // 2. Auto-reply to the client
    await transporter.sendMail({
      from:    `"Vorathel Agency" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: `We've received your request, ${name.split(' ')[0]}!`,
      html:    buildAutoReplyHTML({ name, service }),
    });

    console.log(`✅ Form submitted by ${name} <${email}> — ${service}`);
    res.status(200).json({
      success: true,
      message: 'Thank you! We will contact you within 24 hours.',
    });

  } catch (err) {
    console.error('❌ Mail send error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send. Please try again or contact us directly.',
    });
  }
});

// ── Health check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Vorathel server running on http://localhost:${PORT}`);
  console.log(`📬 Contact endpoint: POST /api/contact`);
  console.log(`🌍 Serving frontend from /public\n`);
});
