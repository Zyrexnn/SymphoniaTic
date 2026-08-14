import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  passwordLoginAPI,
  requestLoginOtpAPI,
  verifyLoginOtpAPI,
} from '@/components/landing/data';
import {
  Field,
  PasswordField,
  ErrorText,
  InfoText,
  Spinner,
  btnPrimary,
  btnGhost,
  useCooldown,
} from './ui';

type LoginMode = 'password' | 'otp';

const OTP_RESEND_SECONDS = 60;

const MODE_TABS: { key: LoginMode; label: string }[] = [
  { key: 'password', label: 'Password' },
  { key: 'otp', label: 'Kode OTP' },
];

function LoginFormInner() {
  const { login } = useAuth();

  const [mode, setMode] = useState<LoginMode>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<1 | 2>(1);

  const { left: cdLeft, start: cdStart, tick: cdTick } = useCooldown(OTP_RESEND_SECONDS);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cdRef.current) clearInterval(cdRef.current);
    };
  }, []);

  const resetMessages = () => {
    setError(null);
    setInfo(null);
  };

  const switchMode = (next: LoginMode) => {
    setMode(next);
    resetMessages();
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await passwordLoginAPI(email.trim(), password);
      if (res.success && res.data?.token) {
        login(res.data.user, res.data.token);
        window.location.href = '/dashboard';
      } else {
        setError(res.message || 'Email atau password salah.');
      }
    } catch {
      setError('Gagal terhubung ke server. Coba lagi.');
    }
    setLoading(false);
  };

  const requestOtp = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await requestLoginOtpAPI(otpEmail.trim());
      if (res.success) {
        setOtpStep(2);
        setInfo('Kode OTP telah dikirim ke email Anda.');
        cdStart();
        if (cdRef.current) clearInterval(cdRef.current);
        cdRef.current = setInterval(cdTick, 1000);
      } else {
        setError(res.message || 'Gagal mengirim OTP.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    }
    setLoading(false);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await verifyLoginOtpAPI(otpEmail.trim(), otpCode.trim());
      if (res.success && res.data?.token) {
        login(res.data.user, res.data.token);
        window.location.href = '/dashboard';
      } else {
        setError(res.message || 'Kode OTP tidak valid.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    }
    setLoading(false);
  };

  const header = (
    <div className="mb-10">
      <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/20">
        SymphoniaTic
      </span>
      <h1 className="text-[28px] sm:text-[32px] leading-[1.15] tracking-[-0.02em] font-light text-white mt-3">
        Masuk ke Akun
      </h1>
      <p className="text-[13px] text-white/35 mt-2.5 font-light leading-relaxed max-w-sm">
        Akses riwayat tiket, refund, dan kelola profil Anda.
      </p>
    </div>
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#171717]">
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-tr-[4rem]"
          style={{ backgroundImage: 'url(/assets/login-image-hd.jpeg)' }}
        />
        <div className="absolute inset-0 bg-[#171717]/40" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#171717] via-[#171717]/60 to-transparent" />

        <div className="relative z-10">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white hover:text-white/70 transition-colors mb-8 group"
          >
            <ArrowLeft size={13} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali
          </a>

          <div className="mb-8">
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-white">
              SymphoniaTic
            </span>
            <h1 className="text-[28px] sm:text-[32px] leading-[1.15] tracking-[-0.02em] font-light text-white mt-3">
              Masuk ke Akun
            </h1>
            <p className="text-[13px] text-white/50 mt-2.5 font-light leading-relaxed max-w-sm">
              Akses riwayat tiket, refund, dan kelola profil Anda.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-12 h-px bg-white/15 mb-4" />
          <p className="text-[10px] font-mono text-white tracking-wider">
            © 2026 SymphoniaTic
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col justify-center rounded-bl-[4rem] px-8 sm:px-16 lg:px-40 py-12 overflow-y-auto">
        <div className="lg:hidden mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/30 hover:text-white/60 transition-colors group"
          >
            <ArrowLeft size={13} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali
          </a>
        </div>

        {header}

        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-lg mb-8 w-fit">
          {MODE_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`px-5 py-2.5 text-[11px] font-mono uppercase tracking-wider rounded-md transition-all duration-200 ${
                mode === key
                  ? 'bg-white text-[#171717] shadow-lg shadow-black/20'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'password' && (
          <form onSubmit={handlePassword} className="flex flex-col gap-5 max-w-md">
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="anda@email.com" required autoComplete="email" />
            <PasswordField label="Kata Sandi" value={password} onChange={setPassword} placeholder="••••••••" required autoComplete="current-password" />
            {error && <ErrorText>{error}</ErrorText>}
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? <Spinner className="w-4 h-4" /> : 'Masuk'}
            </button>
          </form>
        )}

        {mode === 'otp' && otpStep === 1 && (
          <div className="flex flex-col gap-5 max-w-md">
            <Field label="Email" type="email" value={otpEmail} onChange={setOtpEmail} placeholder="anda@email.com" required autoComplete="email" />
            {error && <ErrorText>{error}</ErrorText>}
            {info && <InfoText>{info}</InfoText>}
            <button onClick={requestOtp} disabled={loading || !otpEmail} className={btnPrimary}>
              {loading ? <Spinner className="w-4 h-4" /> : 'Kirim Kode OTP'}
            </button>
          </div>
        )}

        {mode === 'otp' && otpStep === 2 && (
          <form onSubmit={verifyOtp} className="flex flex-col gap-5 max-w-md">
            <p className="text-[11px] text-white/30 font-light">
              Email: <span className="text-white/60">{otpEmail}</span>
            </p>
            <Field label="Kode OTP (6 digit)" value={otpCode} onChange={(v) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required maxLength={6} />
            {error && <ErrorText>{error}</ErrorText>}
            {info && <InfoText>{info}</InfoText>}
            <button type="submit" disabled={loading || otpCode.length !== 6} className={btnPrimary}>
              {loading ? <Spinner className="w-4 h-4" /> : 'Verifikasi & Masuk'}
            </button>
            <button type="button" disabled={cdLeft > 0} onClick={requestOtp} className={btnGhost + ' justify-center'}>
              {cdLeft > 0 ? `Kirim ulang (${cdLeft}s)` : 'Kirim Ulang OTP'}
            </button>
            <button type="button" onClick={() => { setOtpStep(1); setOtpCode(''); resetMessages(); }} className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
              Ganti email
            </button>
          </form>
        )}

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col gap-3 text-[11px] font-light text-white/30 max-w-md">
          <a href="/forgot-password" className="hover:text-white/60 transition-colors w-fit">
            Lupa kata sandi?
          </a>
          <span>
            Belum punya akun?{' '}
            <a href="/register" className="text-white/70 underline underline-offset-4 decoration-white/20 hover:decoration-white/40 hover:text-white transition-all">
              Daftar di sini
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export const LoginForm: React.FC = () => (
  <AuthProvider>
    <LoginFormInner />
  </AuthProvider>
);

export default LoginForm;
