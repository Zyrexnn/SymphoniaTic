import React from 'react';
import { Lock, User, ArrowLeft, LogIn } from 'lucide-react';

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
}) => (
  <div className="min-h-screen w-full bg-[#171717] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
    <div className="w-full max-w-[400px] relative z-10">
      <div className="border border-white/10 bg-[#171717] p-8 sm:p-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <div className="mb-4 inline-flex">
            <div className="w-12 h-12 border border-white/20 flex items-center justify-center bg-white/[0.02]">
              <span className="text-lg font-light text-white tracking-[0.1em]">S</span>
            </div>
          </div>
          <h1 className="text-xl font-light text-white tracking-tight m-0">SymphoniaTic</h1>
          <p className="text-[10px] font-light text-[#9a9a9a] tracking-[0.2em] uppercase m-0 mt-2">
            Portal Administrator
          </p>
          <div className="w-8 h-px bg-white/10 mx-auto mt-4" />
          <p className="text-xs font-light text-[#8a8a8a] m-0 mt-3">
            Masuk untuk mengelola tiket konser, pesanan, dan laporan
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-light">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] font-light text-[#8a99ad] tracking-wider uppercase block mb-2">
              Username
            </label>
            <div className="relative">
              <User size={14} className="text-[#6a6a6a] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                className="w-full bg-transparent border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#4a4a4a] outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-light text-[#8a99ad] tracking-wider uppercase block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="text-[#6a6a6a] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="w-full bg-transparent border border-white/10 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#4a4a4a] outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div className="mt-2.5 p-2.5 border border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-[11px] font-light text-[#7a7a7a]">
              <span>Kredensial Login:</span>
              <span className="font-mono text-white/60">admin / 123</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-light text-xs uppercase tracking-wider border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-30"
          >
            {isLoading ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <LogIn size={13} />
                <span>Masuk ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="/" className="text-[11px] font-light text-[#7a7a7a] hover:text-white no-underline inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={12} />
            <span>Kembali ke halaman utama</span>
          </a>
        </div>
      </div>
    </div>
  </div>
);
