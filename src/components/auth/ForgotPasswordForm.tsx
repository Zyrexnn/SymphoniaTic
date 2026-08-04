import React, { useEffect, useRef, useState } from 'react';
import {
  requestForgotPasswordOtpAPI, verifyForgotPasswordOtpAPI, resetPasswordAPI,
} from '@/components/landing/data';
import { AuthShell, Field, ErrorText, Spinner, btnPrimary, btnGhost, useCooldown } from './ui';

export const ForgotPasswordForm: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { left: cdLeft, start: cdStart, tick: cdTick } = useCooldown(60);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => () => { if (cdRef.current) clearInterval(cdRef.current); }, []);

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    try {
      const res = await requestForgotPasswordOtpAPI(email.trim());
      if (res.success) {
        setStep(2); setInfo('Kode OTP reset telah dikirim ke email Anda.');
        cdStart();
        if (cdRef.current) clearInterval(cdRef.current);
        cdRef.current = setInterval(cdTick, 1000);
      } else setError(res.message || 'Gagal mengirim OTP.');
    } catch { setError('Gagal terhubung ke server.'); }
    setLoading(false);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await verifyForgotPasswordOtpAPI(email.trim(), otpCode.trim());
      if (res.success && res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setStep(3); setInfo('Identitas terverifikasi. Setel kata sandi baru.');
      } else setError(res.message || 'Kode OTP tidak valid.');
    } catch { setError('Gagal terhubung ke server.'); }
    setLoading(false);
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) { setError('Kata sandi minimal 6 karakter.'); return; }
    if (newPassword !== confirmPassword) { setError('Konfirmasi kata sandi tidak cocok.'); return; }
    setLoading(true);
    try {
      const res = await resetPasswordAPI(resetToken, newPassword);
      if (res.success) setDone(true);
      else setError(res.message || 'Gagal mereset kata sandi.');
    } catch { setError('Gagal terhubung ke server.'); }
    setLoading(false);
  };

  if (done) {
    return (
      <AuthShell title="Kata Sandi Diperbarui" subtitle="Silakan masuk dengan kata sandi baru Anda." backHref="/">
        <a href="/login" className={btnPrimary + ' no-underline'}>Ke Halaman Masuk</a>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset Kata Sandi"
      subtitle={step === 1 ? 'Masukkan email akun Anda untuk menerima kode OTP.' : step === 2 ? 'Masukkan kode OTP yang dikirim ke email Anda.' : 'Setel kata sandi baru untuk akun Anda.'}
      backHref="/login"
    >
      {step === 1 && (
        <form onSubmit={requestOtp} className="flex flex-col gap-5">
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="anda@email.com" required autoComplete="email" />
          {error && <ErrorText>{error}</ErrorText>}
          <button type="submit" disabled={loading || !email} className={btnPrimary}>
            {loading ? <Spinner className="w-4 h-4" /> : 'Kirim Kode OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verify} className="flex flex-col gap-5">
          <Field label="Kode OTP (6 digit)" value={otpCode} onChange={(v) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required maxLength={6} />
          {error && <ErrorText>{error}</ErrorText>}
          {info && <ErrorText>{info}</ErrorText>}
          <button type="submit" disabled={loading || otpCode.length !== 6} className={btnPrimary}>
            {loading ? <Spinner className="w-4 h-4" /> : 'Verifikasi OTP'}
          </button>
          <button type="button" disabled={cdLeft > 0} onClick={requestOtp} className={btnGhost + ' justify-center'}>
            {cdLeft > 0 ? `Kirim ulang (${cdLeft}s)` : 'Kirim Ulang OTP'}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={reset} className="flex flex-col gap-5">
          <Field label="Kata Sandi Baru (min. 6 karakter)" type="password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" required autoComplete="new-password" />
          <Field label="Konfirmasi Kata Sandi" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" required autoComplete="new-password" />
          {error && <ErrorText>{error}</ErrorText>}
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? <Spinner className="w-4 h-4" /> : 'Setel Kata Sandi Baru'}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPasswordForm;
