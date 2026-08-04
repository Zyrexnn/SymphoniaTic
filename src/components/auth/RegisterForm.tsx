import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  requestRegisterOtpAPI, verifyRegisterOtpAPI,
} from '@/components/landing/data';
import { AuthShell, Field, ErrorText, Spinner, btnPrimary, btnGhost, useCooldown } from './ui';

function RegisterFormInner() {
  const { login } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { left: cdLeft, start: cdStart, tick: cdTick } = useCooldown(60);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => () => { if (cdRef.current) clearInterval(cdRef.current); }, []);

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    try {
      const res = await requestRegisterOtpAPI(email.trim(), name.trim());
      if (res.success) {
        setStep(2); setInfo('Kode OTP telah dikirim ke email Anda.');
        cdStart();
        if (cdRef.current) clearInterval(cdRef.current);
        cdRef.current = setInterval(cdTick, 1000);
      } else setError(res.message || 'Gagal mengirim OTP.');
    } catch { setError('Gagal terhubung ke server.'); }
    setLoading(false);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError('Kata sandi minimal 6 karakter.'); return; }
    if (password !== confirmPassword) { setError('Konfirmasi kata sandi tidak cocok.'); return; }
    setLoading(true);
    try {
      const res = await verifyRegisterOtpAPI(email.trim(), name.trim(), otpCode.trim(), password);
      if (res.success && res.data?.token) {
        login(res.data.user, res.data.token);
        window.location.href = '/dashboard';
      } else setError(res.message || 'Verifikasi gagal.');
    } catch { setError('Gagal terhubung ke server.'); }
    setLoading(false);
  };

  return (
    <AuthShell
      title="Buat Akun Baru"
      subtitle="Daftar untuk memesan tiket dan kelola riwayat pertunjukan Anda."
      backHref="/"
    >
      {step === 1 ? (
        <form onSubmit={requestOtp} className="flex flex-col gap-5">
          <Field label="Nama Lengkap" value={name} onChange={setName} placeholder="Budi Santoso" required autoComplete="name" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="anda@email.com" required autoComplete="email" />
          {error && <ErrorText>{error}</ErrorText>}
          <button type="submit" disabled={loading || !name || !email} className={btnPrimary}>
            {loading ? <Spinner className="w-4 h-4" /> : 'Kirim Kode OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="flex flex-col gap-5">
          <div className="text-xs text-[#9a9a9a] font-light">
            Nama: <span className="text-white">{name}</span> · Email: <span className="text-white">{email}</span>
          </div>
          <Field label="Kode OTP (6 digit)" value={otpCode} onChange={(v) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required maxLength={6} />
          <Field label="Kata Sandi (min. 6 karakter)" type="password" value={password} onChange={setPassword} placeholder="••••••••" required autoComplete="new-password" />
          <Field label="Konfirmasi Kata Sandi" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" required autoComplete="new-password" />
          {error && <ErrorText>{error}</ErrorText>}
          {info && <ErrorText>{info}</ErrorText>}
          <button type="submit" disabled={loading || otpCode.length !== 6} className={btnPrimary}>
            {loading ? <Spinner className="w-4 h-4" /> : 'Verifikasi & Buat Akun'}
          </button>
          <button type="button" disabled={cdLeft > 0} onClick={requestOtp} className={btnGhost + ' justify-center'}>
            {cdLeft > 0 ? `Kirim ulang (${cdLeft}s)` : 'Kirim Ulang OTP'}
          </button>
          <button type="button" onClick={() => { setStep(1); setOtpCode(''); setError(null); setInfo(null); }} className="text-xs text-[#9a9a9a] hover:text-white transition-colors">
            Ubah data pendaftaran
          </button>
        </form>
      )}

      <div className="mt-10 pt-6 border-t border-white/[0.08] text-xs font-light text-[#9a9a9a]">
        Sudah punya akun? <a href="/login" className="text-white underline underline-offset-4 hover:text-[#9a9a9a]">Masuk di sini</a>
      </div>
    </AuthShell>
  );
}

export const RegisterForm: React.FC = () => (
  <AuthProvider>
    <RegisterFormInner />
  </AuthProvider>
);

export default RegisterForm;
