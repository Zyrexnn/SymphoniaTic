import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const FloatingShape: React.FC<{
  className: string;
  duration: number;
  delay: number;
  xDrift?: number;
  yDrift?: number;
}> = ({ className, duration, delay, xDrift = 0, yDrift = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const startX = Math.random() * 40 - 20;
    const startY = Math.random() * 40 - 20;
    el.style.transform = `translate(${startX}px, ${startY}px)`;
    el.style.opacity = '0';

    const animFrame = () => {
      el.style.transition = `transform ${duration}s ease-in-out ${delay}s, opacity 1.5s ease ${delay + 0.5}s`;
      el.style.transform = `translate(${startX + xDrift}px, ${startY + yDrift}px)`;
      el.style.opacity = '0.06';

      el.addEventListener('transitionend', () => {
        setInterval(() => {
          const nx = Math.random() * 60 - 30;
          const ny = Math.random() * 60 - 30;
          el.style.transition = `transform ${duration + 2}s ease-in-out`;
          el.style.transform = `translate(${nx}px, ${ny}px)`;
        }, (duration + 2) * 1000);
      }, { once: true });
    };
    requestAnimationFrame(animFrame);
  }, [duration, delay, xDrift, yDrift]);

  return <div ref={ref} className={`absolute pointer-events-none ${className}`} />;
};

export const AdminLogin: React.FC<AdminLoginProps> = ({
  username, password, error, isLoading,
  onUsernameChange, onPasswordChange, onSubmit,
}) => (
  <div className="min-h-screen w-full bg-[#171717] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
    <FloatingShape className="w-72 h-72 rounded-full border border-white/[0.03] top-[10%] -left-[10%]" duration={8} delay={0} xDrift={20} yDrift={-10} />
    <FloatingShape className="w-96 h-96 rounded-full border border-white/[0.02] bottom-[5%] -right-[15%]" duration={11} delay={1} xDrift={-15} yDrift={20} />
    <FloatingShape className="w-48 h-48 rounded-full bg-white/[0.01] top-[25%] right-[20%]" duration={9} delay={2} xDrift={10} yDrift={15} />
    <FloatingShape className="w-56 h-56 rounded-full bg-white/[0.008] bottom-[30%] left-[15%]" duration={10} delay={0.5} xDrift={-20} yDrift={-5} />

    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.01] to-transparent pointer-events-none" />

    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[420px] relative"
    >
      <div className="relative border border-white/[0.06] bg-[#171717]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <div className="relative px-8 sm:px-10 pt-10 sm:pt-12 pb-8 sm:pb-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center"
            >
              <div className="mb-5 inline-flex">
                <div className="w-12 h-12 border border-white/[0.12] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-white/[0.02]" />
                  <span className="text-lg font-light text-white tracking-[0.1em] relative z-10">S</span>
                </div>
              </div>
              <h1 className="text-2xl font-light text-white tracking-tight m-0">SymphoniaTic</h1>
              <p className="text-[10px] font-light text-[#9a9a9a] tracking-[0.2em] uppercase m-0 mt-2">
                Portal Administrator
              </p>
              <div className="w-8 h-px bg-white/[0.08] mx-auto mt-4" />
              <p className="text-xs font-light text-[#6a6a6a] m-0 mt-3">
                Masuk untuk mengelola tiket konser, pesanan, dan laporan
              </p>
            </motion.div>

            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-4 py-3 border border-red-500/20 bg-red-500/5"
                >
                  <p className="text-xs font-light text-red-400/80 m-0">{error}</p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <label className="text-[11px] font-light text-[#7a7a7a] tracking-[0.12em] uppercase block mb-2.5">
                  Username
                </label>
                <div className="relative group">
                  <User size={14} strokeWidth={1} className="text-[#5a5a5a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:text-white/40" />
                  <input
                    type="text" required placeholder="admin"
                    value={username}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    className="w-full bg-transparent border border-white/[0.06] pl-10 pr-3.5 py-3 text-[13px] font-light text-white outline-none transition-all duration-300 placeholder:text-[#4a4a4a] focus:border-white/[0.15] focus:bg-white/[0.02]"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <label className="text-[11px] font-light text-[#7a7a7a] tracking-[0.12em] uppercase block mb-2.5">
                  Password
                </label>
                <div className="relative group">
                  <Lock size={14} strokeWidth={1} className="text-[#5a5a5a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:text-white/40" />
                  <input
                    type="password" required placeholder="• • • • • • • •"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full bg-transparent border border-white/[0.06] pl-10 pr-3.5 py-3 text-[13px] font-light text-white outline-none transition-all duration-300 placeholder:text-[#4a4a4a] focus:border-white/[0.15] focus:bg-white/[0.02]"
                  />
                </div>
                <div className="mt-3 px-3 py-2.5 border border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center justify-between text-[11px] font-light text-[#5a5a5a]">
                    <span>Default credentials</span>
                    <span className="font-mono text-white/40 tracking-wider">admin / 123</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="pt-1"
              >
                <button
                  type="submit" disabled={isLoading}
                  className="w-full px-5 py-3 text-[13px] font-light text-white border border-white/[0.08] bg-white/[0.02] flex items-center justify-center gap-2.5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15] active:scale-[0.98] disabled:opacity-30 disabled:cursor-default disabled:hover:bg-white/[0.02] disabled:hover:border-white/[0.08] disabled:active:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20 border-t-white/60 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={14} strokeWidth={1} />
                      <span>Masuk ke Dashboard</span>
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center"
            >
              <a href="/" className="text-[11px] font-light text-[#5a5a5a] no-underline inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#9a9a9a]">
                <ArrowLeft size={11} strokeWidth={1} />
                <span>Kembali ke halaman utama</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] font-light text-[#3a3a3a] tracking-[0.05em] m-0">
          &copy; {new Date().getFullYear()} SymphoniaTic Production
        </p>
      </div>
    </motion.div>
  </div>
);
