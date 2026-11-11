// =====================================================================
// R_M_R — sign-up with a 6-digit email code (sent from Gmail as "R_M_R")
//
// POST { action: 'send',   email, username, language }
// POST { action: 'verify', email, code, password, username, fullName, language }
//
// Required secrets:  GMAIL_USER, GMAIL_APP_PASSWORD
// Codes are stored as bcrypt hashes keyed by SHA-256(email) — see
// supabase/migrations/0003_auth_hardening.sql. Passwords are never stored
// by this function; Supabase Auth keeps only their bcrypt hash.
// =====================================================================
import { createClient } from 'npm:@supabase/supabase-js@2.49.4'
import nodemailer from 'npm:nodemailer@6.9.16'

type Lang = 'uz' | 'ru' | 'en'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_RE = /^[^\s@]{3,30}$/u
const CODE_RE = /^[0-9]{6}$/

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
const fail = (error: string, status = 400) => json({ error }, status)

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const gmailUser = Deno.env.get('GMAIL_USER') ?? ''
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // ports 25/587 are blocked in Edge Functions
  secure: true,
  auth: { user: gmailUser, pass: (Deno.env.get('GMAIL_APP_PASSWORD') ?? '').replace(/\s/g, '') },
})

const TEXT: Record<Lang, { subject: string; title: string; body: string; expires: string; ignore: string }> = {
  uz: {
    subject: 'R_M_R — tasdiqlash kodi',
    title: 'Emailingizni tasdiqlang',
    body: "Ro'yxatdan o'tishni yakunlash uchun ushbu kodni kiriting:",
    expires: 'Kod 10 daqiqa amal qiladi.',
    ignore: "Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.",
  },
  ru: {
    subject: 'R_M_R — код подтверждения',
    title: 'Подтвердите email',
    body: 'Введите этот код, чтобы завершить регистрацию:',
    expires: 'Код действует 10 минут.',
    ignore: 'Если вы не регистрировались, просто проигнорируйте это письмо.',
  },
  en: {
    subject: 'R_M_R — verification code',
    title: 'Confirm your email',
    body: 'Enter this code to finish signing up:',
    expires: 'The code is valid for 10 minutes.',
    ignore: "If you didn't sign up, you can safely ignore this email.",
  },
}

const sendCodeEmail = (to: string, code: string, lang: Lang) => {
  const t = TEXT[lang]
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#0b1020;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="max-width:440px;background:#111a2e;border:1px solid #1e293b;border-radius:16px;padding:32px">
      <tr><td style="font-size:20px;font-weight:700;color:#22d3ee;letter-spacing:1px">R_M_R</td></tr>
      <tr><td style="padding-top:20px;font-size:20px;font-weight:700;color:#f8fafc">${t.title}</td></tr>
      <tr><td style="padding-top:8px;font-size:15px;line-height:1.5;color:#cbd5e1">${t.body}</td></tr>
      <tr><td align="center" style="padding:24px 0">
        <div style="display:inline-block;padding:14px 24px;border-radius:12px;background:#0b1020;border:1px solid #22d3ee;font-size:32px;font-weight:700;letter-spacing:10px;color:#f8fafc;font-family:'Courier New',monospace">${code}</div>
      </td></tr>
      <tr><td style="font-size:13px;color:#94a3b8">${t.expires}</td></tr>
      <tr><td style="padding-top:6px;font-size:13px;color:#64748b">${t.ignore}</td></tr>
    </table>
  </td></tr></table></body></html>`
  return transporter.sendMail({
    from: { name: 'R_M_R', address: gmailUser },
    to,
    subject: t.subject,
    text: `${t.title}\n\n${t.body} ${code}\n\n${t.expires}\n${t.ignore}`,
    html,
  })
}

const randomCode = () => {
  // Rejection sampling → uniform 000000–999999
  const buf = new Uint32Array(1)
  let n: number
  do {
    crypto.getRandomValues(buf)
    n = buf[0]
  } while (n >= 4_294_000_000)
  return String(n % 1_000_000).padStart(6, '0')
}

const asLang = (v: unknown): Lang => (v === 'ru' || v === 'en' ? v : 'uz')
const str = (v: unknown) => (typeof v === 'string' ? v : '')

/** Raised Postgres exceptions come back as error.message — map to our codes. */
const dbError = (message: string) =>
  ['email_taken', 'code_cooldown', 'too_many_codes'].find((c) => message.includes(c)) ?? 'generic'

async function usernameAvailable(username: string) {
  const { data, error } = await admin.rpc('is_username_available', { p_username: username })
  if (error) throw error
  return data === true
}

async function handleSend(body: Record<string, unknown>) {
  const email = str(body.email).trim().toLowerCase()
  const username = str(body.username).trim().toLowerCase()
  const lang = asLang(body.language)
  if (!EMAIL_RE.test(email)) return fail('invalid_email')
  if (!USERNAME_RE.test(username)) return fail('invalid_username')
  if (!gmailUser) return fail('email_send_failed', 500)

  if (!(await usernameAvailable(username))) return fail('username_taken', 409)

  const code = randomCode()
  const { error } = await admin.rpc('signup_issue_code', { p_email: email, p_code: code })
  if (error) {
    const c = dbError(error.message)
    return fail(c, c === 'email_taken' ? 409 : c === 'generic' ? 500 : 429)
  }

  try {
    await sendCodeEmail(email, code, lang)
  } catch (err) {
    console.error('sendMail failed', err)
    await admin.rpc('signup_cancel_code', { p_email: email })
    return fail('email_send_failed', 502)
  }
  return json({ ok: true })
}

async function handleVerify(body: Record<string, unknown>) {
  const email = str(body.email).trim().toLowerCase()
  const code = str(body.code).trim()
  const password = str(body.password)
  const username = str(body.username).trim().toLowerCase()
  const fullName = str(body.fullName).trim()
  const language = asLang(body.language)

  if (!EMAIL_RE.test(email)) return fail('invalid_email')
  if (!CODE_RE.test(code)) return fail('code_invalid')
  if (!USERNAME_RE.test(username)) return fail('invalid_username')
  if (fullName.length < 2 || fullName.length > 60) return fail('invalid_name')
  if (password.length < 6 || new TextEncoder().encode(password).length > 72) return fail('weak_password')

  const { data: status, error } = await admin.rpc('signup_check_code', { p_email: email, p_code: code })
  if (error) return fail('generic', 500)
  if (status !== 'ok') {
    const map: Record<string, string> = {
      invalid: 'code_invalid',
      expired: 'code_expired',
      attempts: 'code_attempts',
      missing: 'code_expired',
    }
    return fail(map[status as string] ?? 'code_invalid')
  }

  if (!(await usernameAvailable(username))) return fail('username_taken', 409)

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, username, language },
  })
  if (createError) {
    const msg = createError.message.toLowerCase()
    if (msg.includes('already') || msg.includes('exists')) return fail('email_taken', 409)
    if (msg.includes('password')) return fail('weak_password')
    console.error('createUser failed', createError)
    return fail('generic', 500)
  }

  await admin.rpc('signup_consume_code', { p_email: email })
  return json({ ok: true })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return fail('method_not_allowed', 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return fail('bad_request')
  }

  try {
    if (body.action === 'send') return await handleSend(body)
    if (body.action === 'verify') return await handleVerify(body)
    return fail('bad_request')
  } catch (err) {
    console.error(err)
    return fail('generic', 500)
  }
})
