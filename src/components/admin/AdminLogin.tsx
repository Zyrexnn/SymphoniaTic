import React from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowLeft } from 'lucide-react';

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
  <div className="min-h-screen w-full bg-[#171717] flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-[400px] border border-white/10 bg-[#171717] p-8"
    >
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className="w-11 h-11 border border-white/[0.15] inline-flex items-center justify-center">
            <span className="text-base font-light text-white tracking-[0.1em]">S</span>
          </div>
        </div>
        <div>
          <span className="text-[9px] font-light text-[#9a9a9a] tracking-[0.2em] uppercase block">
            PORTAL ADMINISTRATOR
          </span>
          <h1 className="text-xl font-light text-white tracking-tight mt-3 mb-1">SymphoniaTic Admin</h1>
          <p className="text-xs font-light text-[#9a9a9a] m-0">Otorisasi Manajemen Tiket Konser & Analytics</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="px-3.5 py-2.5 border border-white/[0.1] text-xs font-light text-[#9a9a9a]">{error}</div>
        )}

        <div>
          <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-2">Username Administrator</label>
          <div className="relative">
            <User size={14} strokeWidth={1} className="text-[#9a9a9a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text" required placeholder="admin"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className="w-full bg-transparent border border-white/[0.1] pl-9 pr-3 py-2.5 text-[13px] font-light text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-2">Password Akses</label>
          <div className="relative">
            <Lock size={14} strokeWidth={1} className="text-[#9a9a9a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password" required placeholder="123"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full bg-transparent border border-white/[0.1] pl-9 pr-3 py-2.5 text-[13px] font-light text-white outline-none"
            />
          </div>
          <div className="mt-2 px-2.5 py-2 border border-white/[0.06] text-[11px] font-light text-[#9a9a9a] flex justify-between">
            <span>Default Credentials:</span>
            <span className="font-mono text-white">admin / 123</span>
          </div>
        </div>

        <button
          type="submit" disabled={isLoading}
          className={`w-full px-5 py-2.5 text-[13px] font-light text-white border border-white bg-transparent flex items-center justify-center gap-2 ${isLoading ? 'opacity-40 cursor-default' : 'cursor-pointer hover:opacity-60'}`}
        >
          <span>{isLoading ? 'Memverifikasi...' : 'Masuk Ke Dashboard Admin'}</span>
        </button>
      </form>

      <div className="border-t border-white/10 mt-6 pt-6 text-center">
        <a href="/"
          className="text-xs font-light text-[#9a9a9a] no-underline inline-flex items-center gap-1.5 hover:text-white"
        >
          <ArrowLeft size={12} strokeWidth={1} />
          <span>Kembali Ke Landing Page Main Site</span>
        </a>
      </div>
    </motion.div>
  </div>
);
