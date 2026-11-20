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
  { key: 'password', label: 'Kata Sandi' },
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

  const requestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
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

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#F6F4EE] text-[#171614]">
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#11100E] text-white">
        <img
          src="/assets/login-image-hd.jpeg"
          alt="Gedung konser orkestra simfoni"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#11100E]/60" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#11100E] via-[#11100E]/75 to-transparent" />

        <div className="relative z-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 text-xs font-medium text-[#E7E2D8] hover:text-white transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </a>

          <div className="mt-10">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E7E2D8]">
              SymphoniaTic
            </span>
            <h2 className="font-display text-4xl leading-tight tracking-tight font-semibold text-white mt-3">
              Portal Tiket Resmi Pertunjukan Simfoni
            </h2>
            <p className="text-sm text-[#D8D3C8] mt-3 font-normal leading-relaxed max-w-sm">
              Satu akun untuk seluruh jadwal pertunjukan orkestra, opera, dan resital piano pilihan.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-12 h-px bg-[#C93018] mb-4" />
          <p className="text-xs text-[#D8D3C8] m-0">
            &copy; {new Date().getFullYear()} SymphoniaTic Official
          </p>
        </div>
      </div>

      <main className="w-full lg:w-[56%] flex-1 flex flex-col justify-center px-5 sm:px-10 md:px-16 lg:px-16 xl:px-24 py-8 sm:py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-2 min-h-[44px] px-2 -ml-2 text-xs font-medium text-[#5C5850] hover:text-[#171614] transition-colors rounded-lg"
            >
              <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Kembali ke Beranda</span>
            </a>
          </div>

          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C93018]">
              SymphoniaTic
            </span>
            <h1 className="font-display text-3xl sm:text-4xl leading-tight tracking-[-0.02em] font-semibold text-[#171614] mt-2">
              Masuk ke Akun
            </h1>
            <p className="text-sm text-[#5C5850] mt-2 font-normal leading-relaxed">
              Akses riwayat e-ticket, pengajuan refund, dan kelola profil Anda.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Metode masuk"
            className="grid grid-cols-2 gap-1.5 p-1.5 bg-white border border-[#E4DFD3] rounded-xl mb-7"
          >
            {MODE_TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => switchMode(key)}
                className={`min-h-[44px] px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                  mode === key
                    ? 'bg-[#171614] text-white'
                    : 'text-[#5C5850] hover:text-[#171614] hover:bg-[#F6F4EE]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'password' && (
            <form onSubmit={handlePassword} className="flex flex-col gap-5">
              <Field
                label="Alamat Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="anda@email.com"
                required
                autoComplete="email"
              />
              <PasswordField
                label="Kata Sandi"
                value={password}
                onChange={setPassword}
                placeholder="Masukkan kata sandi"
                required
                autoComplete="current-password"
              />
              {error && <ErrorText>{error}</ErrorText>}
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <Spinner className="w-5 h-5" /> : 'Masuk'}
              </button>
            </form>
          )}

          {mode === 'otp' && otpStep === 1 && (
            <form onSubmit={requestOtp} className="flex flex-col gap-5">
              <Field
                label="Alamat Email"
                type="email"
                value={otpEmail}
                onChange={setOtpEmail}
                placeholder="anda@email.com"
                required
                autoComplete="email"
              />
              {error && <ErrorText>{error}</ErrorText>}
              {info && <InfoText>{info}</InfoText>}
              <button type="submit" disabled={loading || !otpEmail} className={btnPrimary}>
                {loading ? <Spinner className="w-5 h-5" /> : 'Kirim Kode OTP'}
              </button>
            </form>
          )}

          {mode === 'otp' && otpStep === 2 && (
            <form onSubmit={verifyOtp} className="flex flex-col gap-5">
              <p className="text-xs text-[#5C5850] m-0">
                Kode dikirim ke <span className="text-[#171614] font-semibold">{otpEmail}</span>
              </p>
              <Field
                label="Kode OTP (6 digit)"
                value={otpCode}
                onChange={(v) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                maxLength={6}
              />
              {error && <ErrorText>{error}</ErrorText>}
              {info && <InfoText>{info}</InfoText>}
              <button type="submit" disabled={loading || otpCode.length !== 6} className={btnPrimary}>
                {loading ? <Spinner className="w-5 h-5" /> : 'Verifikasi & Masuk'}
              </button>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button type="button" disabled={cdLeft > 0} onClick={() => requestOtp()} className={btnGhost + ' flex-1 justify-center'}>
                  {cdLeft > 0 ? `Kirim ulang (${cdLeft}s)` : 'Kirim Ulang OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpStep(1); setOtpCode(''); resetMessages(); }}
                  className={btnGhost + ' flex-1 justify-center'}
                >
                  Ganti Email
                </button>
              </div>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-[#E4DFD3] flex flex-col gap-3 text-sm text-[#5C5850]">
            <a href="/forgot-password" className="hover:text-[#C93018] transition-colors w-fit py-1">
              Lupa kata sandi?
            </a>
            <span>
              Belum punya akun?{' '}
              <a href="/register" className="text-[#C93018] underline underline-offset-4 hover:text-[#A82511] font-semibold">
                Daftar di sini
              </a>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export const LoginForm: React.FC = () => (
  <AuthProvider>
    <LoginFormInner />
  </AuthProvider>
);

export default LoginForm;
