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
    <div className="min-h-screen w-full bg-[#171717] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="border border-white/[0.08] bg-[#1a1a1a] p-8 sm:p-10 space-y-6 shadow-2xl">
          {/* Header Branding */}
          <div className="text-center">
            <div className="mb-4 inline-flex">
              <div className="w-12 h-12 border border-white/20 flex items-center justify-center bg-white/[0.02]">
                <span className="text-lg font-light text-white tracking-[0.1em]">S</span>
              </div>
            </div>
            <h1 className="text-xl font-light text-white tracking-tight m-0">SymphoniaTic</h1>
            <p className="text-[10px] font-light text-[#9a9a9a] tracking-[0.2em] uppercase m-0 mt-2">
              PORTAL ADMINISTRATOR
            </p>
            <div className="w-8 h-px bg-white/10 mx-auto mt-4" />
            <p className="text-xs font-light text-[#9a9a9a] m-0 mt-3 leading-relaxed">
              Masuk untuk mengelola postingan konser, transaksi tiket, dan permohonan refund
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-light leading-relaxed">
                {error}
              </div>
            )}

            <div>
              <label className="text-[11px] font-light text-[#9a9a9a] tracking-wider uppercase block mb-2">
                Username Admin
              </label>
              <div className="relative">
                <User size={14} className="text-[#9a9a9a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#5a5a5a] outline-none focus:border-white/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-light text-[#9a9a9a] tracking-wider uppercase block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="text-[#9a9a9a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#5a5a5a] outline-none focus:border-white/40 transition-colors"
                />
              </div>
            </div>

            {/* Quick Demo Fill Button */}
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2 px-3 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-[#9a9a9a] hover:text-white text-[11px] font-light transition-colors cursor-pointer flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5"><KeyRound size={12} /> Gunakan Kredensial Demo</span>
              <span className="font-mono text-white/60">admin / 123</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-white text-[#171717] hover:bg-white/90 font-normal text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
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

          <div className="text-center pt-2 border-t border-white/[0.08]">
            <a href="/" className="text-[11px] font-light text-[#9a9a9a] hover:text-white no-underline inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeft size={12} />
              <span>Kembali ke Halaman Utama</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
