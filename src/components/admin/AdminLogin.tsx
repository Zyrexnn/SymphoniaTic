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
  <div style={{ minHeight: '100vh', width: '100%', background: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.06)', background: '#171717', padding: 32 }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', letterSpacing: '0.1em' }}>S</span>
          </div>
        </div>
        <div>
          <span style={{ fontSize: 9, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block' }}>
            PORTAL ADMINISTRATOR
          </span>
          <h1 style={{ fontSize: 20, fontWeight: 300, color: '#ffffff', letterSpacing: '-0.02em', margin: '12px 0 4px' }}>SymphoniaTic Admin</h1>
          <p style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', margin: 0 }}>Otorisasi Manajemen Tiket Konser & Analytics</p>
        </div>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && (
          <div style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 300, color: '#9a9a9a' }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Username Administrator</label>
          <div style={{ position: 'relative' }}>
            <User size={14} strokeWidth={1} style={{ color: '#9a9a9a', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text" required placeholder="admin"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 12px 10px 36px', fontSize: 13, fontWeight: 300, color: '#ffffff', outline: 'none',
              }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password Akses</label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} strokeWidth={1} style={{ color: '#9a9a9a', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="password" required placeholder="123"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 12px 10px 36px', fontSize: 13, fontWeight: 300, color: '#ffffff', outline: 'none',
              }} />
          </div>
          <div style={{ marginTop: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 300, color: '#9a9a9a', display: 'flex', justifyContent: 'space-between' }}>
            <span>Default Credentials:</span>
            <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>admin / 123</span>
          </div>
        </div>

        <button
          type="submit" disabled={isLoading}
          style={{
            padding: '10px 20px', fontSize: 13, fontWeight: 300, color: '#ffffff',
            border: '1px solid #ffffff', background: 'transparent', cursor: isLoading ? 'default' : 'pointer',
            opacity: isLoading ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%',
          }}>
          <span>{isLoading ? 'Memverifikasi...' : 'Masuk Ke Dashboard Admin'}</span>
        </button>
      </form>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 24, paddingTop: 24, textAlign: 'center' }}>
        <a href="/"
          style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={12} strokeWidth={1} />
          <span>Kembali Ke Landing Page Main Site</span>
        </a>
      </div>
    </motion.div>
  </div>
);
