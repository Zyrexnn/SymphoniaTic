import React, { useState, useId } from 'react';
import {
  Lock,
  User,
  ArrowLeft,
  LogIn,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  QrCode,
  Crown,
} from 'lucide-react';
import type { AdminRole } from '../landing/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminThemeToggle } from './AdminThemeContext';

interface AdminLoginProps {
  username: string;
  password: string;
  error: string;
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

type RoleScope = AdminRole;

export const AdminLogin: React.FC<AdminLoginProps> = ({
  username,
  password,
  error,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [roleScope, setRoleScope] = useState<RoleScope>(() => {
    const clean = username.trim().toLowerCase();
    if (clean === 'petugas') return 'PETUGAS';
    if (clean === 'superadmin') return 'SUPER_ADMIN';
    return 'ADMIN';
  });
  const usernameId = useId();
  const passwordId = useId();

  const handleRoleScopeChange = (val: string) => {
    if (val === 'PETUGAS' || val === 'SUPER_ADMIN' || val === 'ADMIN') {
      setRoleScope(val);
    }
  };

  const applyDemoCredentials = (targetRole: RoleScope) => {
    setRoleScope(targetRole);
    const demoUser =
      targetRole === 'SUPER_ADMIN' ? 'superadmin' : targetRole === 'PETUGAS' ? 'petugas' : 'admin';
    onUsernameChange(demoUser);
    onPasswordChange('123');
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-background text-foreground font-sans">
      <aside className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#141413] text-[#F4F3EF] border-r border-[#141413]">
        <img
          src="/assets/login-image.svg"
          alt="Suasana ruang konser orkestra simfoni"
          width={1200}
          height={1600}
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#141413]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/45 to-[#141413]/65" />

        <div className="relative z-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 text-xs font-bold uppercase tracking-wider text-[#D8D6CE] hover:text-[#D4FF2A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
          >
            <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </a>

          <div className="mt-10 space-y-4">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4FF2A]">
              • SymphoniaTic. Production
            </span>
            <h2 className="font-display text-4xl xl:text-5xl leading-[0.98] tracking-[-0.04em] font-extrabold text-[#F4F3EF] m-0">
              Gerbang Operasional Konser &amp; Kontrol Gate
            </h2>
            <p className="text-sm text-[#D8D6CE] font-normal leading-relaxed max-w-md m-0">
              Satu pintu masuk terpadu untuk tim manajemen acara serta petugas pemindaian tiket di aula pertunjukan.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="grid grid-cols-1 gap-3 border border-white/15 bg-[#141413]/85 rounded-none p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-none bg-[#D4FF2A] text-[#141413] flex items-center justify-center shrink-0 mt-0.5">
                <Crown size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#F4F3EF] m-0">Super Admin</p>
                <p className="text-xs text-[#D8D6CE] mt-0.5 m-0 leading-relaxed">
                  Supervisi penuh, kelola akun staf RBAC, pantau log audit, serta ekspor laporan keuangan.
                </p>
              </div>
            </div>
            <div className="h-px bg-white/15" />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-none bg-white/20 text-[#F4F3EF] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#F4F3EF] m-0">Administrator</p>
                <p className="text-xs text-[#D8D6CE] mt-0.5 m-0 leading-relaxed">
                  Kelola metrik pendapatan, jadwal konser, kuota kursi, promo, pesanan, dan tinjauan refund.
                </p>
              </div>
            </div>
            <div className="h-px bg-white/15" />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-none bg-white/10 text-[#F4F3EF] flex items-center justify-center shrink-0 mt-0.5">
                <QrCode size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#F4F3EF] m-0">Petugas Gate</p>
                <p className="text-xs text-[#D8D6CE] mt-0.5 m-0 leading-relaxed">
                  Pemindaian QR E-Ticket, pantauan kehadiran langsung, dan check-in manual di pintu masuk.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="w-12 h-0.5 bg-[#D4FF2A] mb-3" />
            <p className="text-xs text-[#D8D6CE] m-0 font-mono">
              &copy; {new Date().getFullYear()} SymphoniaTic. Official
            </p>
          </div>
        </div>
      </aside>

      <div className="w-full lg:w-[56%] flex-1 flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-14 xl:px-20 py-5 sm:py-8">
        <header className="flex items-center justify-between gap-3 w-full max-w-[460px] mx-auto lg:max-w-none">
          <a
            href="/"
            className="lg:hidden inline-flex items-center gap-2 min-h-[44px] px-2 -ml-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Beranda</span>
          </a>
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-bold uppercase tracking-[0.16em] text-foreground bg-primary px-2 py-0.5 text-[#141413]">
              Gateway Operasional
            </span>
          </div>
          <AdminThemeToggle showLabel />
        </header>

        <main className="mx-auto w-full max-w-[460px] my-auto py-6 sm:py-8">
          <Card className="border-border-strong bg-card">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none border border-border-strong bg-[#141413] text-[#D4FF2A] flex items-center justify-center shrink-0">
                    <span className="font-display text-xl font-extrabold">S.</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground block">
                      SymphoniaTic.
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      Portal Admin &amp; Petugas Gate
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {roleScope === 'SUPER_ADMIN'
                    ? 'SUPER ADMIN'
                    : roleScope === 'PETUGAS'
                    ? 'GATE ACCESS'
                    : 'ADMIN ACCESS'}
                </Badge>
              </div>

              <div className="pt-1">
                <h1 className="font-display text-3xl sm:text-[34px] leading-[0.98] tracking-[-0.04em] font-extrabold text-card-foreground m-0">
                  Masuk Panel Operasional
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5 mb-0 leading-relaxed">
                  {roleScope === 'SUPER_ADMIN'
                    ? 'Kendali penuh manajemen akun staf RBAC, audit keamanan, dan laporan konser.'
                    : roleScope === 'PETUGAS'
                    ? 'Akses khusus petugas pintu masuk untuk pemindaian QR dan verifikasi penonton.'
                    : 'Kelola pertunjukan, kuota kategori kursi, laporan transaksi, dan refund.'}
                </p>
              </div>

              <Tabs value={roleScope} onValueChange={handleRoleScopeChange} className="pt-1">
                <TabsList className="grid w-full grid-cols-3 h-11 p-1">
                  <TabsTrigger value="SUPER_ADMIN" className="min-h-[36px] text-[11px] font-bold uppercase tracking-wider">
                    Super Admin
                  </TabsTrigger>
                  <TabsTrigger value="ADMIN" className="min-h-[36px] text-[11px] font-bold uppercase tracking-wider">
                    Admin
                  </TabsTrigger>
                  <TabsTrigger value="PETUGAS" className="min-h-[36px] text-[11px] font-bold uppercase tracking-wider">
                    Petugas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="space-y-5">
              <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-none border border-[#C81E1E] bg-[#C81E1E]/10 text-[#C81E1E] dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200 text-sm flex items-start gap-2.5 leading-relaxed"
                  >
                    <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor={usernameId}>Username Staf</Label>
                  <div className="relative">
                    <User
                      size={16}
                      className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <Input
                      id={usernameId}
                      type="text"
                      required
                      autoComplete="username"
                      placeholder={
                        roleScope === 'SUPER_ADMIN'
                          ? 'superadmin'
                          : roleScope === 'PETUGAS'
                          ? 'petugas'
                          : 'admin'
                      }
                      value={username}
                      onChange={(e) => onUsernameChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={passwordId}>Kata Sandi</Label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <Input
                      id={passwordId}
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => onPasswordChange(e.target.value)}
                      className="pl-10 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center text-muted-foreground hover:text-foreground rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {showPassword ? (
                        <EyeOff size={16} aria-hidden="true" />
                      ) : (
                        <Eye size={16} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full mt-2"
                >
                  {isLoading ? (
                    <span>Memverifikasi Kredensial...</span>
                  ) : (
                    <>
                      <LogIn size={16} aria-hidden="true" />
                      <span>
                        {roleScope === 'SUPER_ADMIN'
                          ? 'Masuk Konsol Super Admin'
                          : roleScope === 'PETUGAS'
                          ? 'Masuk Konsol Gate'
                          : 'Masuk ke Dashboard Admin'}
                      </span>
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-border space-y-2.5">
                <p className="text-xs font-medium text-muted-foreground m-0">
                  Isi cepat akun demo lokal:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={roleScope === 'SUPER_ADMIN' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => applyDemoCredentials('SUPER_ADMIN')}
                    className="min-h-[44px] justify-between px-2.5"
                  >
                    <span className="flex items-center gap-1.5 text-xs">
                      <Crown size={13} aria-hidden="true" />
                      <span>Super</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">superadmin</span>
                  </Button>

                  <Button
                    type="button"
                    variant={roleScope === 'ADMIN' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => applyDemoCredentials('ADMIN')}
                    className="min-h-[44px] justify-between px-2.5"
                  >
                    <span className="flex items-center gap-1.5 text-xs">
                      <KeyRound size={13} aria-hidden="true" />
                      <span>Admin</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">admin</span>
                  </Button>

                  <Button
                    type="button"
                    variant={roleScope === 'PETUGAS' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => applyDemoCredentials('PETUGAS')}
                    className="min-h-[44px] justify-between px-2.5"
                  >
                    <span className="flex items-center gap-1.5 text-xs">
                      <KeyRound size={13} aria-hidden="true" />
                      <span>Petugas</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">petugas</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <footer className="mx-auto w-full max-w-[460px] text-center text-xs text-muted-foreground lg:hidden">
          &copy; {new Date().getFullYear()} SymphoniaTic Official
        </footer>
        <div className="hidden lg:block" />
      </div>
    </div>
  );
};
