import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, ShieldCheck, LockKeyhole, PackageCheck, UserRound, X, Mail, MapPin, Phone, Sparkles } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
type User = { id: number; email: string; first_name: string; last_name: string }
type Notice = { type: 'success' | 'error' | 'info'; text: string } | null

function validEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) }
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.detail || body.message || 'Something went wrong. Please try again.')
  return body as T
}

export default function App() {
  const [tab, setTab] = useState<'checkout' | 'register'>('checkout')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [otp, setOtp] = useState('')
  const [demoOtp, setDemoOtp] = useState('')
  const [recognized, setRecognized] = useState(false)
  const [recognitionDone, setRecognitionDone] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const recognitionTimer = useRef<number | undefined>(undefined)
  const lastPromptedEmail = useRef('')

  useEffect(() => {
    api<User>('/api/me').then(setLoggedInUser).catch(() => {})
  }, [])

  useEffect(() => {
    window.clearTimeout(recognitionTimer.current)
    setRecognitionDone(false)
    setRecognized(false)
    if (tab !== 'checkout' || !validEmail(email)) return
    recognitionTimer.current = window.setTimeout(async () => {
      try {
        const result = await api<{ registered: boolean; first_name?: string; last_name?: string }>(`/api/recognize?email=${encodeURIComponent(email)}`)
        setRecognized(result.registered)
        setRecognitionDone(true)
        if (result.registered && lastPromptedEmail.current !== email.toLowerCase() && !loggedInUser) {
          lastPromptedEmail.current = email.toLowerCase()
          setOtp('')
          setModalOpen(true)
        }
      } catch { setRecognitionDone(false) }
    }, 450)
    return () => window.clearTimeout(recognitionTimer.current)
  }, [email, loggedInUser, tab])

  async function register(e: FormEvent) {
    e.preventDefault(); setNotice(null); setBusy(true)
    try {
      const result = await api<{ message: string; otp: string }>('/api/register', { method: 'POST', body: JSON.stringify({ email, first_name: firstName, last_name: lastName }) })
      setDemoOtp(result.otp)
      setNotice({ type: 'success', text: `${result.message} Your six-digit demo code is shown below.` })
    } catch (err) { setNotice({ type: 'error', text: (err as Error).message }) }
    finally { setBusy(false) }
  }

  async function verify(e: FormEvent) {
    e.preventDefault(); setBusy(true); setNotice(null)
    try {
      const user = await api<User>('/api/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) })
      setLoggedInUser(user); setModalOpen(false); setNotice({ type: 'success', text: `Welcome back, ${user.first_name}. You're securely signed in.` })
    } catch (err) { setNotice({ type: 'error', text: (err as Error).message }) }
    finally { setBusy(false) }
  }

  async function checkout(e: FormEvent) {
    e.preventDefault(); setBusy(true); setNotice(null)
    try {
      await api('/api/checkout', { method: 'POST', body: JSON.stringify({ email, phone, shipping_address: address }) })
      setSubmitted(true); setNotice({ type: 'success', text: 'Checkout details saved successfully. No payment was processed.' })
    } catch (err) { setNotice({ type: 'error', text: (err as Error).message }) }
    finally { setBusy(false) }
  }

  async function logout() {
    try { await api('/api/logout', { method: 'POST' }) } catch {}
    setLoggedInUser(null); setNotice({ type: 'info', text: 'You have been signed out.' }); lastPromptedEmail.current = ''
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); setTab('checkout') }}><span className="brand-mark"><Sparkles size={19}/></span><span>northstar<span className="brand-dot">.</span></span></a>
      <div className="topbar-right"><span className="secure-label"><LockKeyhole size={14}/> Secure checkout demo</span><span className="avatar">N</span></div>
    </header>
    <main className="layout">
      <section className="intro">
        <div className="eyebrow"><span className="eyebrow-line"/> PASSWORDLESS CHECKOUT</div>
        <h1>A smoother way<br/>to <span>check out.</span></h1>
        <p className="intro-copy">Your details, recognized in a moment. Sign in securely when you're ready — or keep moving as a guest.</p>
        <div className="benefits">
          <div className="benefit"><span className="benefit-icon"><ShieldCheck size={19}/></span><div><strong>Secure by design</strong><small>One-time codes. No passwords to remember.</small></div></div>
          <div className="benefit"><span className="benefit-icon"><PackageCheck size={19}/></span><div><strong>Checkout at your pace</strong><small>Fill in your details while we recognize you.</small></div></div>
          <div className="benefit"><span className="benefit-icon"><UserRound size={19}/></span><div><strong>Your choice, always</strong><small>Sign in or skip and continue as a guest.</small></div></div>
        </div>
        <div className="trust-note"><span className="trust-dot"/> Demo environment <span className="trust-sep">·</span> No real payments</div>
      </section>

      <section className="card">
        <div className="card-top"><div><div className="step-label">YOUR DETAILS <span>01 / 02</span></div><h2>{tab === 'checkout' ? 'Checkout' : 'Create your account'}</h2><p>{tab === 'checkout' ? 'Where should we send your order?' : 'Register once for a quicker checkout next time.'}</p></div><div className="card-icon">{tab === 'checkout' ? <PackageCheck size={22}/> : <UserRound size={22}/>}</div></div>
        <div className="tabs"><button className={tab === 'checkout' ? 'tab active' : 'tab'} onClick={() => { setTab('checkout'); setNotice(null) }}>Checkout</button><button className={tab === 'register' ? 'tab active' : 'tab'} onClick={() => { setTab('register'); setNotice(null); setDemoOtp('') }}>Register</button></div>
        {notice && <div className={`notice ${notice.type}`} role="status">{notice.type === 'success' && <CheckCircle2 size={17}/>}<span>{notice.text}</span></div>}
        {tab === 'register' ? <form onSubmit={register} className="form">
          <label>Email address <span className="required">*</span><div className="input-wrap"><Mail size={17}/><input aria-label="Registration email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setDemoOtp('') }}/></div></label>
          <div className="two-col"><label>First name <span className="required">*</span><input aria-label="First name" required maxLength={100} placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)}/></label><label>Last name <span className="required">*</span><input aria-label="Last name" required maxLength={100} placeholder="Morgan" value={lastName} onChange={e => setLastName(e.target.value)}/></label></div>
          <button className="primary-btn" disabled={busy || !validEmail(email) || !firstName.trim() || !lastName.trim()}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={17}/></button>
          {demoOtp && <div className="otp-result"><span>Your one-time demo code</span><strong aria-label="Generated OTP">{demoOtp}</strong><small>For this assignment demo only. Code expires in 10 minutes.</small><button type="button" className="text-btn" onClick={() => { setTab('checkout'); setEmail(email); setNotice(null) }}>Continue to checkout →</button></div>}
        </form> : <form onSubmit={checkout} className="form">
          {loggedInUser && <div className="signed-in"><div className="signed-avatar">{loggedInUser.first_name[0]}</div><div><small>WELCOME BACK</small><strong>{loggedInUser.first_name} {loggedInUser.last_name}</strong><span>{loggedInUser.email}</span></div><button type="button" className="text-btn" onClick={logout}>Sign out</button></div>}
          <label>Email address <span className="required">*</span><div className={`input-wrap ${validEmail(email) && recognitionDone ? (recognized ? 'recognized' : '') : ''}`}><Mail size={17}/><input aria-label="Checkout email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setSubmitted(false) }}/>{validEmail(email) && recognitionDone && <span className="field-status">{recognized ? 'Account found' : 'Guest checkout'}</span>}</div>{email && !validEmail(email) && <small className="field-hint error-text">Enter a valid email address.</small>}</label>
          <label>Phone number <span className="required">*</span><div className="input-wrap"><Phone size={17}/><input aria-label="Phone number" type="tel" required minLength={5} maxLength={40} autoComplete="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)}/></div></label>
          <label>Shipping address <span className="required">*</span><div className="input-wrap textarea-wrap"><MapPin size={17}/><textarea aria-label="Shipping address" required minLength={5} maxLength={2000} autoComplete="street-address" placeholder="House / flat, street, city, postal code" rows={3} value={address} onChange={e => setAddress(e.target.value)}/></div></label>
          <div className="guest-note"><ShieldCheck size={16}/><span>{loggedInUser ? 'Your account is recognized. Your checkout details are ready to save.' : 'You can check out as a guest. We may recognize your account as you type.'}</span></div>
          <button className="primary-btn" disabled={busy || !validEmail(email) || phone.trim().length < 5 || address.trim().length < 5 || submitted}>{busy ? 'Saving details…' : submitted ? 'Details saved' : 'Save checkout details'} <ArrowRight size={17}/></button>
          <div className="form-foot"><LockKeyhole size={13}/> Encrypted in transit when deployed with HTTPS <span>·</span> No payment processing</div>
        </form>}
        <div className="card-bottom"><span>Powered by <strong>northstar</strong> demo</span><span>Privacy <span className="bullet">·</span> Help</span></div>
      </section>
    </main>
    <footer className="page-footer"><span>© 2026 Northstar Checkout Demo</span><span><span className="green-dot"/> All systems operational</span></footer>

    {modalOpen && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="otp-title">
      <button className="modal-close" aria-label="Close OTP modal" onClick={() => setModalOpen(false)}><X size={19}/></button>
      <div className="modal-icon"><ShieldCheck size={25}/></div><div className="modal-kicker">WELCOME BACK</div><h2 id="otp-title">It's you, right?</h2><p>We found an account for <strong>{email}</strong>. Enter your six-digit one-time code to sign in.</p>
      <form onSubmit={verify} className="form modal-form"><label>One-time code<input aria-label="One-time code" autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} minLength={6} required placeholder="••••••" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}/></label><button className="primary-btn" disabled={busy || otp.length !== 6}>{busy ? 'Verifying…' : 'Verify and continue'} <ArrowRight size={17}/></button></form>
      <button className="skip-btn" onClick={() => { setModalOpen(false); setNotice({ type: 'info', text: 'Continuing as a guest. You can submit checkout without signing in.' }) }}>Skip for now, continue as guest</button>
      <div className="modal-foot"><LockKeyhole size={13}/> Your code is verified securely by the API.</div>
    </section></div>}
  </div>
}
