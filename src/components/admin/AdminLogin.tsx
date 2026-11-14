import React, { useState } from 'react';
import { Lock, User, ArrowLeft, LogIn, KeyRound } from 'lucide-react';

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
  const fillDemoCredentials = () => {
    onUsernameChange('admin');
    onPasswordChange('123');
  };

  return (
    <div className="min-h-screen w-full bg-[#0C0D12] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        <div className="border border-[#272A38] bg-[#14161F] p-8 sm:p-10 space-y-6 shadow-2xl rounded-2xl">
          <div className="text-center">
            <div className="mb-4 inline-flex">
              <div className="w-12 h-12 rounded-xl border border-[#272A38] flex items-center justify-center bg-[#0C0D12]">
                <span className="text-lg font-bold text-white tracking-[0.1em]">S</span>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight m-0">SymphoniaTic</h1>
            <p className="text-[10px] font-semibold text-[#A1A1AA] tracking-[0.2em] uppercase m-0 mt-2">
              PORTAL ADMINISTRATOR
            </p>
            <div className="w-8 h-px bg-[#272A38] mx-auto mt-4" />
            <p className="text-xs font-normal text-[#A1A1AA] m-0 mt-3 leading-relaxed">
              Masuk untuk mengelola postingan konser, transaksi tiket, dan permohonan refund
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-normal leading-relaxed">
                {error}
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-[#A1A1AA] tracking-wider uppercase block mb-2">
                Username Admin
              </label>
              <div className="relative">
                <User size={14} className="text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#71717A] outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#A1A1AA] tracking-wider uppercase block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#71717A] outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] text-[#71717A] font-medium uppercase tracking-wider mb-1">Pilihan Login Cepat Demo:</p>
              <button
                type="button"
                onClick={() => { onUsernameChange('admin'); onPasswordChange('123'); }}
                className="w-full py-2 px-3 border border-[#272A38] bg-[#0C0D12] hover:border-white/40 rounded-lg text-[#A1A1AA] hover:text-white text-[11px] font-normal transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5"><KeyRound size={12} className="text-white" /> Administrator Penuh</span>
                <span className="font-mono text-white">admin / 123</span>
              </button>

              <button
                type="button"
                onClick={() => { onUsernameChange('petugas'); onPasswordChange('123'); }}
                className="w-full py-2 px-3 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg text-emerald-400 text-[11px] font-normal transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5"><KeyRound size={12} /> Petugas Gate Scanner</span>
                <span className="font-mono text-emerald-300">petugas / 123</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-white text-[#0C0D12] hover:bg-neutral-200 font-semibold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                isLoading ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
              }`}
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <LogIn size={14} />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#272A38]">
            <a href="/" className="text-[11px] font-medium text-[#A1A1AA] hover:text-white no-underline inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeft size={12} />
              <span>Kembali ke Halaman Utama</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
