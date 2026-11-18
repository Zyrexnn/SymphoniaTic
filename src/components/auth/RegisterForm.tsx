import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  requestRegisterOtpAPI,
  verifyRegisterOtpAPI,
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
        window.location.href = '/dashboard';
      } else {
        setError(res.message || 'Verifikasi gagal.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#0C0D12] text-white selection:bg-white selection:text-black">
      <main className="w-full lg:w-[56%] flex-1 flex flex-col justify-center px-5 sm:px-10 md:px-16 lg:px-16 xl:px-24 py-8 sm:py-12 order-2 lg:order-1">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-2 min-h-[44px] px-2 -ml-2 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors rounded-lg"
            >
              <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Kembali ke Beranda</span>
            </a>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A1A1AA]">
                SymphoniaTic
              </span>
              <span className="text-xs font-mono text-[#E4E4E7] bg-[#14161F] border border-[#272A38] px-2.5 py-1 rounded-md">
                Langkah {step} dari 2
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl leading-tight tracking-tight font-semibold text-white mt-2">
              Buat Akun Baru
            </h1>
            <p className="text-sm text-[#A1A1AA] mt-2 font-normal leading-relaxed">
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
              <div className="p-3.5 rounded-xl bg-[#14161F] border border-[#272A38] text-xs text-[#A1A1AA]">
                Mendaftar sebagai <span className="text-white font-medium">{name}</span> ({email})
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

          <div className="mt-10 pt-6 border-t border-[#272A38] text-sm text-[#A1A1AA]">
            Sudah punya akun?{' '}
            <a
              href="/login"
              className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white font-medium"
            >
              Masuk di sini
            </a>
          </div>
        </div>
      </main>

      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden order-1 lg:order-2 border-l border-[#272A38]">
        <img
          src="/assets/register-image.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0C0D12]/65" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#0C0D12] via-[#0C0D12]/75 to-transparent" />

        <div className="relative z-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 text-xs font-medium text-[#E4E4E7] hover:text-white transition-colors rounded-lg"
          >
            <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </a>

          <div className="mt-10">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E4E4E7]">
              SymphoniaTic
            </span>
            <h2 className="text-3xl leading-tight tracking-tight font-semibold text-white mt-3">
              Bergabung Bersama Kami
            </h2>
            <p className="text-sm text-[#D4D4D8] mt-3 font-normal leading-relaxed max-w-sm">
              Simpan seluruh e-ticket konser Anda dalam satu tempat dan pantau status pengembalian dana dengan mudah.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-12 h-px bg-white/25 mb-4" />
          <p className="text-xs text-[#A1A1AA] m-0">
            &copy; {new Date().getFullYear()} SymphoniaTic Official
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
