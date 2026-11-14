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

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const header = (
    <div className="mb-10">
      <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#71717A]">
        SymphoniaTic
      </span>
      <h1 className="text-[28px] sm:text-[32px] leading-[1.15] tracking-tight font-medium text-white mt-3">
        Buat Akun Baru
      </h1>
      <p className="text-sm text-[#A1A1AA] mt-2.5 font-normal leading-relaxed max-w-sm">
        Daftar untuk memesan tiket dan kelola riwayat pertunjukan Anda.
      </p>
    </div>
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0C0D12] text-white selection:bg-white selection:text-black">
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 lg:px-40 py-12 overflow-y-auto order-2 lg:order-1 bg-[#0C0D12]">
        <div className="lg:hidden mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors group"
          >
            <ArrowLeft size={13} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Beranda
          </a>
        </div>

        {header}

        {step === 1 && (
          <form onSubmit={requestOtp} className="flex flex-col gap-5 max-w-md">
            <Field
              label="Nama Lengkap"
              value={name}
              onChange={setName}
              placeholder="Budi Santoso"
              required
              autoComplete="name"
            />
            <Field
              label="Email"
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
              {loading ? <Spinner className="w-4 h-4" /> : 'Kirim Kode OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verify} className="flex flex-col gap-5 max-w-md">
            <p className="text-xs text-[#A1A1AA] font-normal">
              Nama: <span className="text-white font-medium">{name}</span>{' '}
              · Email: <span className="text-white font-medium">{email}</span>
            </p>
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
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <PasswordField
              label="Konfirmasi Kata Sandi"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
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
              {loading ? <Spinner className="w-4 h-4" /> : 'Verifikasi & Buat Akun'}
            </button>
            <button
              type="button"
              disabled={cdLeft > 0}
              onClick={requestOtp}
              className={btnGhost + ' justify-center'}
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
              className="text-xs text-[#71717A] hover:text-white transition-colors"
            >
              Ubah data pendaftaran
            </button>
          </form>
        )}

        <div className="mt-12 pt-6 border-t border-[#272A38] text-xs text-[#A1A1AA] max-w-md">
          Sudah punya akun?{' '}
          <a
            href="/login"
            className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all font-medium"
          >
            Masuk di sini
          </a>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[45%] rounded-tl-[4rem] relative flex-col justify-between p-12 overflow-hidden order-1 lg:order-2 border-l border-[#272A38]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-tr-[4rem]"
          style={{ backgroundImage: 'url(/assets/register-image.jpg)' }}
        />
        <div className="absolute inset-0 bg-[#0C0D12]/60" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0C0D12] via-[#0C0D12]/70 to-transparent" />

        <div className="relative z-10">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={13} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Beranda
          </a>

          <div className="mb-8">
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#A1A1AA]">
              SymphoniaTic
            </span>
            <h1 className="text-[28px] sm:text-[32px] leading-[1.15] tracking-tight font-medium text-white mt-3">
              Bergabung Bersama Kami
            </h1>
            <p className="text-sm text-[#A1A1AA] mt-2.5 font-normal leading-relaxed max-w-sm">
              Nikmati kemudahan pemesanan konser orkestra simfoni dengan konfirmasi tempat duduk instan.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-12 h-px bg-white/20 mb-4" />
          <p className="text-[10px] font-mono text-[#71717A] tracking-wider uppercase">
            © 2026 SymphoniaTic Official
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
