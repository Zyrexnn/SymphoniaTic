import React, { useState, useId } from 'react';
import { Lock, User, ArrowLeft, LogIn, KeyRound, Eye, EyeOff } from 'lucide-react';
import { fieldInputBase } from '@/components/ui/form-controls';

interface AdminLoginProps {
  username: string;
  password: string;
  error: string;
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  username, password, error, isLoading,
  onUsernameChange, onPasswordChange, onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const usernameId = useId();
  const passwordId = useId();

  return (
    <div className="min-h-[100dvh] w-full bg-[#0C0D12] text-white flex flex-col justify-between p-5 sm:p-8 font-sans">
      <div className="mx-auto w-full max-w-5xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Kembali ke Halaman Utama</span>
        </a>
      </div>

      <main className="mx-auto w-full max-w-[440px] my-auto py-8">
        <div className="border border-[#272A38] bg-[#14161F] p-6 sm:p-9 space-y-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl border border-[#3E4357] flex items-center justify-center bg-[#0C0D12]">
                <span className="text-base font-bold text-white tracking-[0.1em]">S</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">SymphoniaTic</span>
                <span className="text-[11px] font-medium text-[#A1A1AA] tracking-wider uppercase block">
                  Portal Administrator &amp; Gate
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight m-0">
              Masuk Panel Operasional
            </h1>
            <p className="text-sm text-[#A1A1AA] m-0 mt-2 leading-relaxed">
              Kelola jadwal konser, transaksi tiket, pengajuan refund, dan pemindaian QR di gerbang masuk.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div role="alert" className="p-3.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-200 text-sm leading-relaxed">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor={usernameId} className="text-xs font-medium text-[#E4E4E7] block">
                Username
              </label>
              <div className="relative">
                <User size={16} className="text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id={usernameId}
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  className={`${fieldInputBase} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={passwordId} className="text-xs font-medium text-[#E4E4E7] block">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock size={16} className="text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className={`${fieldInputBase} pl-10 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center text-[#94A3B8] hover:text-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs text-[#94A3B8] font-medium m-0">Isi cepat akun demo lokal:</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => { onUsernameChange('admin'); onPasswordChange('123'); }}
                  className="w-full min-h-[44px] py-2.5 px-3.5 border border-[#3E4357] bg-[#0C0D12] hover:border-white/60 rounded-lg text-[#E4E4E7] hover:text-white text-xs transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><KeyRound size={14} aria-hidden="true" /> Administrator Penuh</span>
                  <span className="font-mono text-white">admin / 123</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onUsernameChange('petugas'); onPasswordChange('123'); }}
                  className="w-full min-h-[44px] py-2.5 px-3.5 border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-300 text-xs transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><KeyRound size={14} aria-hidden="true" /> Petugas Gate Scanner</span>
                  <span className="font-mono text-emerald-200">petugas / 123</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] py-3 px-4 bg-white text-[#0C0D12] hover:bg-neutral-200 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <LogIn size={16} aria-hidden="true" />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl text-center text-xs text-[#94A3B8]">
        &copy; {new Date().getFullYear()} SymphoniaTic Production
      </footer>
    </div>
  );
};
