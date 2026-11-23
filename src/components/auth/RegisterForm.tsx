import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  requestRegisterOtpAPI,
  verifyRegisterOtpAPI,
  resolveSafeAuthRedirect,
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

const OTP_RESEND_SECONDS = 60;

function RegisterFormInner() {
  const { login } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const requestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    resetMessages();
    try {
      const res = await requestRegisterOtpAPI(email.trim(), name.trim());
      if (res.success) {
        setStep(2);
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

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyRegisterOtpAPI(
        email.trim(),
        name.trim(),
        otpCode.trim(),
        password
      );
      if (res.success && res.data?.token) {
        login(res.data.user, res.data.token);
        window.location.href = resolveSafeAuthRedirect('/dashboard');
      } else {
        setError(res.message || 'Verifikasi gagal.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    }
    setLoading(false);
  };

  const loginHref =
    typeof window !== 'undefined' && window.location.search
      ? `/login${window.location.search}`
      : '/login';

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#F4F3EF] text-[#141413]">
      <main className="w-full lg:w-[56%] flex-1 flex flex-col justify-center px-5 sm:px-10 md:px-16 lg:px-16 xl:px-24 py-8 sm:py-12 order-2 lg:order-1">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-2 min-h-[44px] px-2 -ml-2 text-xs font-bold uppercase tracking-wider text-[#52514D] hover:text-[#141413] transition-colors"
            >
              <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
              <span>Kembali ke Beranda</span>
            </a>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#141413] bg-[#D4FF2A] px-2 py-0.5">
                SymphoniaTic.
              </span>
              <span className="text-xs font-mono font-bold text-[#141413] bg-white border border-[#DFDDD6] px-2.5 py-1 rounded-none">
                Langkah {step} dari 2
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl leading-[0.98] tracking-[-0.04em] font-extrabold text-[#141413] mt-3">
              Buat Akun Baru
            </h1>
            <p className="text-sm text-[#52514D] mt-2 font-normal leading-relaxed">
              Daftar untuk memesan tiket dan mengelola riwayat pertunjukan Anda.
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={requestOtp} className="flex flex-col gap-5">
              <Field
                label="Nama Lengkap"
                value={name}
                onChange={setName}
                placeholder="Nama lengkap Anda"
                required
                autoComplete="name"
              />
              <Field
                label="Alamat Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="anda@email.com"
                required
                autoComplete="email"
              />
              {error && <ErrorText>{error}</ErrorText>}
              <button
                type="submit"
                disabled={loading || !name || !email}
                className={btnPrimary}
              >
                {loading ? <Spinner className="w-5 h-5" /> : 'Kirim Kode OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verify} className="flex flex-col gap-5">
              <div className="p-3.5 rounded-none bg-white border border-[#DFDDD6] text-xs text-[#52514D]">
                Mendaftar sebagai <span className="text-[#141413] font-bold">{name}</span> ({email})
              </div>
              <Field
                label="Kode OTP (6 digit)"
                value={otpCode}
                onChange={(v) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                maxLength={6}
              />
              <PasswordField
                label="Kata Sandi (min. 6 karakter)"
                value={password}
                onChange={setPassword}
                placeholder="Minimal 6 karakter"
                required
                autoComplete="new-password"
              />
              <PasswordField
                label="Konfirmasi Kata Sandi"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Ulangi kata sandi"
                required
                autoComplete="new-password"
              />
              {error && <ErrorText>{error}</ErrorText>}
              {info && <InfoText>{info}</InfoText>}
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className={btnPrimary}
              >
                {loading ? <Spinner className="w-5 h-5" /> : 'Verifikasi & Buat Akun'}
              </button>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={cdLeft > 0}
                  onClick={() => requestOtp()}
                  className={btnGhost + ' flex-1 justify-center'}
                >
                  {cdLeft > 0 ? `Kirim ulang (${cdLeft}s)` : 'Kirim Ulang OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpCode('');
                    resetMessages();
                  }}
                  className={btnGhost + ' flex-1 justify-center'}
                >
                  Ubah Data
                </button>
              </div>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-[#DFDDD6] text-sm text-[#52514D]">
            Sudah punya akun?{' '}
            <a
              href={loginHref}
              className="text-[#141413] underline underline-offset-4 hover:bg-[#D4FF2A] px-1 font-bold"
            >
              Masuk di sini
            </a>
          </div>
        </div>
      </main>

      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden order-1 lg:order-2 bg-[#141413] text-[#F4F3EF] border-l border-[#141413]">
        <img
          src="/assets/register-image.jpg"
          alt="Pertunjukan orkestra klasik"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#141413]/65" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#141413] via-[#141413]/80 to-transparent" />

        <div className="relative z-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 text-xs font-bold uppercase tracking-wider text-[#D8D6CE] hover:text-[#D4FF2A] transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </a>

          <div className="mt-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4FF2A]">
              • SymphoniaTic.
            </span>
            <h2 className="font-display text-4xl xl:text-5xl leading-[0.98] tracking-[-0.04em] font-extrabold text-[#F4F3EF] mt-3">
              Bergabung Bersama Kami
            </h2>
            <p className="text-sm text-[#D8D6CE] mt-3 font-normal leading-relaxed max-w-sm">
              Simpan seluruh e-ticket konser Anda dalam satu tempat dan pantau status pengembalian dana dengan mudah.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-12 h-0.5 bg-[#D4FF2A] mb-4" />
          <p className="text-xs text-[#D8D6CE] m-0 font-mono">
            &copy; {new Date().getFullYear()} SymphoniaTic. Official
          </p>
        </div>
      </div>
    </div>
  );
}

export const RegisterForm: React.FC = () => (
  <AuthProvider>
    <RegisterFormInner />
  </AuthProvider>
);

export default RegisterForm;
