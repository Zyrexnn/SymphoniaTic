import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  passwordLoginAPI, requestLoginOtpAPI, verifyLoginOtpAPI,
} from '@/components/landing/data';
import { AuthShell, Field, ErrorText, Spinner, btnPrimary, btnGhost, useCooldown } from './ui';

function LoginFormInner() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'password' | 'otp'>('password');

  // password mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // otp mode
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const { left: cdLeft, start: cdStart, tick: cdTick } = useCooldown(60);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => () => { if (cdRef.current) clearInterval(cdRef.current); }, []);

  const redirect = () => { window.location.href = '/dashboard'; };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await passwordLoginAPI(email.trim(), password);
      if (res.success && res.data?.token) { login(res.data.user, res.data.token); redirect(); }
      else setError(res.message || 'Email atau password salah.');
    } catch { setError('Gagal terhubung ke server. Coba lagi.'); }
    setLoading(false);
  };

  const requestOtp = async () => {
    setLoading(true); setError(null); setInfo(null);
    try {
      const res = await requestLoginOtpAPI(otpEmail.trim());
      if (res.success) {
        setOtpStep(2); setInfo('Kode OTP telah dikirim ke email Anda.');
        cdStart();
        if (cdRef.current) clearInterval(cdRef.current);
        cdRef.current = setInterval(cdTick, 1000);
      } else setError(res.message || 'Gagal mengirim OTP.');
    } catch { setError('Gagal terhubung ke server.'); }
    setLoading(false);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await verifyLoginOtpAPI(otpEmail.trim(), otpCode.trim());
      if (res.success && res.data?.token) { login(res.data.user, res.data.token); redirect(); }
      else setError(res.message || 'Kode OTP tidak valid.');
    } catch { setError('Gagal terhubung ke server.'); }
    setLoading(false);
  };

  return (
    <AuthShell
      title="Masuk ke Akun"
      subtitle="Akses riwayat tiket, refund, dan kelola profil Anda."
      backHref="/"
    >
      {/* Mode tabs */}
      <div className="flex border-b border-white/[0.08] mb-8">
        {(['password', 'otp'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); setInfo(null); }}
            className={`px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
              mode === m ? 'text-white border-b border-white' : 'text-[#9a9a9a] hover:text-white'
            }`}
          >
            {m === 'password' ? 'Password' : 'Kode OTP'}
          </button>
        ))}
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePassword} className="flex flex-col gap-5">
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="anda@email.com" required autoComplete="email" />
          <Field label="Kata Sandi" type="password" value={password} onChange={setPassword} placeholder="••••••••" required autoComplete="current-password" />
          {error && <ErrorText>{error}</ErrorText>}
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? <Spinner className="w-4 h-4" /> : 'Masuk'}
          </button>
        </form>
      ) : (
        otpStep === 1 ? (
          <div className="flex flex-col gap-5">
            <Field label="Email" type="email" value={otpEmail} onChange={setOtpEmail} placeholder="anda@email.com" required autoComplete="email" />
            {error && <ErrorText>{error}</ErrorText>}
            {info && <ErrorText>{info}</ErrorText>}
            <button onClick={requestOtp} disabled={loading || !otpEmail} className={btnPrimary}>
              {loading ? <Spinner className="w-4 h-4" /> : 'Kirim Kode OTP'}
            </button>
          </div>
        ) : (
          <form onSubmit={verifyOtp} className="flex flex-col gap-5">
            <div className="text-xs text-[#9a9a9a] font-light">Email: <span className="text-white">{otpEmail}</span></div>
            <Field label="Kode OTP (6 digit)" value={otpCode} onChange={(v) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required maxLength={6} />
            {error && <ErrorText>{error}</ErrorText>}
            {info && <ErrorText>{info}</ErrorText>}
            <button type="submit" disabled={loading || otpCode.length !== 6} className={btnPrimary}>
              {loading ? <Spinner className="w-4 h-4" /> : 'Verifikasi & Masuk'}
            </button>
            <button type="button" disabled={cdLeft > 0} onClick={requestOtp} className={btnGhost + ' justify-center'}>
              {cdLeft > 0 ? `Kirim ulang (${cdLeft}s)` : 'Kirim Ulang OTP'}
            </button>
            <button type="button" onClick={() => { setOtpStep(1); setOtpCode(''); setError(null); setInfo(null); }} className="text-xs text-[#9a9a9a] hover:text-white transition-colors">
              Ganti email
            </button>
          </form>
        )
      )}

      <div className="mt-10 pt-6 border-t border-white/[0.08] flex flex-col gap-3 text-xs font-light text-[#9a9a9a]">
        <a href="/forgot-password" className="hover:text-white transition-colors">Lupa kata sandi?</a>
        <span>Belum punya akun? <a href="/register" className="text-white underline underline-offset-4 hover:text-[#9a9a9a]">Daftar di sini</a></span>
      </div>
    </AuthShell>
  );
}

export const LoginForm: React.FC = () => (
  <AuthProvider>
    <LoginFormInner />
  </AuthProvider>
);

export default LoginForm;
