import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShieldCheck, RefreshCw, KeyRound, CreditCard, User,
  AlertCircle, CheckCircle2, Search, Clock, XCircle, ArrowRight, Info, Lock
} from 'lucide-react';
import { getApiBaseUrl, formatIDR } from '../landing/data';

interface RefundDetail {
  id: string;
  orderId: string;
  orderCode: string;
  userEmail: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  reason: string;
  refundAmount: number;
  status: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
  eventTitle?: string;
  categoryName?: string;
  quantity?: number;
  userName?: string;
}

const BANK_PRESETS = [
  { name: 'Bank BCA', code: 'BCA' },
  { name: 'Bank Mandiri', code: 'MANDIRI' },
  { name: 'Bank BNI', code: 'BNI' },
  { name: 'Bank BRI', code: 'BRI' },
  { name: 'Bank Jago', code: 'JAGO' },
  { name: 'GoPay', code: 'GOPAY' },
  { name: 'OVO', code: 'OVO' },
  { name: 'DANA', code: 'DANA' },
];

export const RefundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'status'>('request');

  // Step 1 State: Request OTP
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderCode, setOrderCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 2 State: OTP & Bank Form
  const [otpCode, setOtpCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [reason, setReason] = useState('');

  // Step 3 Result State
  const [submittedData, setSubmittedData] = useState<{
    orderCode: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
  } | null>(null);

  // Status Lookup State
  const [lookupCode, setLookupCode] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<{
    orderStatus: string;
    refundDetail: RefundDetail;
  } | null>(null);

  // Handlers
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !userEmail.trim()) {
      setErrorMsg('Kode pesanan dan email pemegang tiket wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/refunds/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: orderCode.trim(), userEmail: userEmail.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Gagal mengirim kode verifikasi OTP.');
      }

      setSuccessMsg(data.message);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi gangguan koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setErrorMsg('Harap masukkan kode OTP 6-digit dan lengkapi data rekening tujuan.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/refunds/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: orderCode.trim(),
          userEmail: userEmail.trim(),
          otpCode: otpCode.trim(),
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim(),
          reason: reason.trim(),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Gagal menyimpan pengajuan refund.');
      }

      setSubmittedData({
        orderCode: orderCode.trim(),
        bankName: bankName.trim(),
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
      });
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim() || !lookupEmail.trim()) {
      setLookupError('Kode pesanan dan email pemegang tiket wajib diisi.');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setStatusResult(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/refunds/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: lookupCode.trim(),
          userEmail: lookupEmail.trim(),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Data permohonan refund tidak ditemukan.');
      }

      setStatusResult(data.data);
    } catch (err: any) {
      setLookupError(err.message || 'Gagal mengambil status permohonan.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col justify-between selection:bg-white selection:text-[#171717] font-sans">
      {/* Top Header — Minimalist Atelier Bar */}
      <header className="sticky top-0 z-40 bg-[#171717]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-white hover:opacity-60 transition-opacity no-underline">
            <ArrowLeft className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1.5} />
            <span className="text-sm font-light tracking-[-0.05px]">Kembali ke Beranda</span>
          </a>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1.5} />
            <span className="text-xs font-light tracking-[0.2em] text-[#9a9a9a] uppercase">SymphoniaTic — Layanan Refund</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[920px] w-full mx-auto px-6 py-16 sm:py-24">
        {/* Left-Aligned Editorial Hero Headline Block */}
        <div className="mb-16 space-y-4">
          <div className="text-xs font-light tracking-[0.2em] uppercase text-[#9a9a9a] flex items-center gap-2">
            <span>↓</span>
            <span>Portal Pengembalian Dana Resmi</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-light tracking-[-0.03em] text-white leading-tight max-w-3xl">
            Pengajuan &amp; Pemantauan Refund Tiket
          </h1>

          <p className="text-sm sm:text-base font-light text-[#9a9a9a] max-w-[640px] leading-relaxed pt-2">
            Pengembalian dana dapat diajukan secara langsung tanpa perlu login. Verifikasi keamanan diproses menggunakan kode OTP 6-digit yang dikirim ke email pemesan tiket.
          </p>
        </div>

        {/* Minimalist Tab Navigation Bar */}
        <div className="flex items-center gap-8 sm:gap-12 border-b border-white/10 pb-4 mb-12">
          <button
            onClick={() => { setActiveTab('request'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`text-xs sm:text-sm uppercase tracking-[0.15em] font-light pb-4 -mb-[17px] transition-colors cursor-pointer border-b-2 bg-transparent text-left ${
              activeTab === 'request'
                ? 'text-white border-white font-medium'
                : 'text-[#9a9a9a] hover:text-white border-transparent'
            }`}
          >
            01. Ajukan Refund Baru
          </button>
          <button
            onClick={() => { setActiveTab('status'); setLookupError(null); }}
            className={`text-xs sm:text-sm uppercase tracking-[0.15em] font-light pb-4 -mb-[17px] transition-colors cursor-pointer border-b-2 bg-transparent text-left ${
              activeTab === 'status'
                ? 'text-white border-white font-medium'
                : 'text-[#9a9a9a] hover:text-white border-transparent'
            }`}
          >
            02. Pantau Status Refund
          </button>
        </div>

        {/* TAB 1: FORM PENGAJUAN REFUND */}
        {activeTab === 'request' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            {/* Step Progress Stepper */}
            {step < 3 && (
              <div className="flex items-center gap-6 sm:gap-8 border-b border-white/10 pb-6 text-xs uppercase tracking-[0.15em] font-light">
                <div className={`flex items-center gap-2.5 ${step >= 1 ? 'text-white font-medium' : 'text-[#9a9a9a]'}`}>
                  <span className={`text-[10px] font-mono px-2 py-0.5 border ${step >= 1 ? 'border-white text-white' : 'border-white/20 text-[#9a9a9a]'}`}>
                    01
                  </span>
                  <span>Validasi Tiket</span>
                </div>
                <span className="text-white/20">—</span>
                <div className={`flex items-center gap-2.5 ${step >= 2 ? 'text-white font-medium' : 'text-[#9a9a9a]'}`}>
                  <span className={`text-[10px] font-mono px-2 py-0.5 border ${step >= 2 ? 'border-white text-white' : 'border-white/20 text-[#9a9a9a]'}`}>
                    02
                  </span>
                  <span>Kode OTP &amp; Transfer Bank</span>
                </div>
              </div>
            )}

            {/* Error & Success Feedback Alerts */}
            {errorMsg && (
              <div className="p-4 border border-white/30 bg-white/[0.03] text-white text-xs font-light flex items-center gap-3 rounded-none">
                <AlertCircle className="w-4 h-4 shrink-0 text-white/70" strokeWidth={1.5} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && step === 2 && (
              <div className="p-4 border border-white/40 bg-white/[0.05] text-white text-xs font-light flex items-center gap-3 rounded-none">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" strokeWidth={1.5} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* STEP 1: VALIDASI TIKET */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-8 max-w-2xl">
                <div className="space-y-2.5">
                  <label className="block text-xs font-light text-[#9a9a9a] uppercase tracking-[0.15em]">
                    Kode Pesanan (Order Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SYM-893472"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#171717] border border-white/20 px-4 py-3.5 text-sm font-mono text-white placeholder-[#9a9a9a]/50 outline-none focus:border-white transition-colors rounded-none"
                  />
                  <p className="text-[11px] text-[#9a9a9a] font-light">
                    Kode unik transaksi yang tercantum pada E-Ticket resmi SymphoniaTic Anda.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-xs font-light text-[#9a9a9a] uppercase tracking-[0.15em]">
                    Email Pemegang Tiket *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@domain.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-[#171717] border border-white/20 px-4 py-3.5 text-sm text-white placeholder-[#9a9a9a]/50 outline-none focus:border-white transition-colors rounded-none"
                  />
                  <p className="text-[11px] text-[#9a9a9a] font-light">
                    Email yang dimasukkan saat menyelesaikan checkout pemesanan tiket.
                  </p>
                </div>

                {/* Terms and Eligibility Notice */}
                <div className="p-6 border border-white/10 space-y-3 text-xs text-[#9a9a9a] rounded-none bg-transparent">
                  <div className="flex items-center gap-2 text-white font-medium uppercase tracking-[0.15em] text-[11px]">
                    <Info className="w-3.5 h-3.5 text-white/70" strokeWidth={1.5} />
                    <span>Syarat &amp; Ketentuan Kelayakan Refund:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] text-[#9a9a9a] font-light leading-relaxed">
                    <li>Status pesanan harus dalam status terverifikasi (<strong className="text-white">VERIFIED</strong>).</li>
                    <li>Tiket belum pernah digunakan untuk pemindaian gate check-in di lokasi venue.</li>
                    <li>Proses audit dan pencairan dana dilaksanakan tim Finance dalam 1–3 hari kerja.</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-[#171717] hover:bg-white/90 font-normal py-4 px-8 text-xs uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center justify-center gap-3 rounded-none disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#171717]" />
                      <span>Memverifikasi Kode Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-[#171717]" strokeWidth={1.5} />
                      <span>Minta Kode Verifikasi OTP Email</span>
                      <ArrowRight className="w-4 h-4 text-[#171717]" strokeWidth={1.5} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP & BANK TRANSFER FORM */}
            {step === 2 && (
              <form onSubmit={handleSubmitRefund} className="space-y-8 max-w-2xl">
                {/* OTP Code Box */}
                <div className="p-6 border border-white/30 text-left space-y-3 bg-transparent rounded-none">
                  <label className="block text-xs font-light text-white uppercase tracking-[0.15em]">
                    Kode Verifikasi OTP (6-Digit) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#171717] border border-white/30 px-4 py-3.5 text-2xl font-mono tracking-[0.6em] text-center text-white placeholder-[#9a9a9a]/40 outline-none focus:border-white transition-colors rounded-none"
                  />
                  <div className="flex justify-between items-center text-[11px] text-[#9a9a9a] pt-1">
                    <span>Kode OTP telah dikirimkan ke email Anda (berlaku 10 menit).</span>
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      className="text-white underline hover:opacity-70 bg-transparent border-none cursor-pointer p-0"
                    >
                      Kirim Ulang OTP
                    </button>
                  </div>
                </div>

                {/* Bank Selector Presets */}
                <div className="space-y-3">
                  <label className="block text-xs font-light text-[#9a9a9a] uppercase tracking-[0.15em]">
                    Pilih Bank / E-Wallet Tujuan *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {BANK_PRESETS.map((bp) => (
                      <button
                        key={bp.code}
                        type="button"
                        onClick={() => setBankName(bp.name)}
                        className={`py-3 px-3 text-xs font-mono border transition-all text-center cursor-pointer rounded-none ${
                          bankName === bp.name
                            ? 'border-white bg-white text-[#171717] font-medium'
                            : 'border-white/15 bg-transparent text-[#9a9a9a] hover:border-white/40 hover:text-white'
                        }`}
                      >
                        {bp.name}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Atau tuliskan nama bank lain (Contoh: Bank Danamon)"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-[#171717] border border-white/20 px-4 py-3 text-sm text-white placeholder-[#9a9a9a]/50 outline-none focus:border-white transition-colors rounded-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-light text-[#9a9a9a] uppercase tracking-[0.15em]">
                      Nomor Rekening / No. E-Wallet *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" strokeWidth={1.5} />
                      <input
                        type="text"
                        required
                        placeholder="1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-[#171717] border border-white/20 pl-10 pr-4 py-3.5 text-sm font-mono text-white placeholder-[#9a9a9a]/50 outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-light text-[#9a9a9a] uppercase tracking-[0.15em]">
                      Nama Pemilik Rekening *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" strokeWidth={1.5} />
                      <input
                        type="text"
                        required
                        placeholder="Nama sesuai rekening tabungan"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className="w-full bg-[#171717] border border-white/20 pl-10 pr-4 py-3.5 text-sm text-white placeholder-[#9a9a9a]/50 outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-light text-[#9a9a9a] uppercase tracking-[0.15em]">
                    Alasan Pembatalan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan catatan alasan permohonan refund..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-[#171717] border border-white/20 px-4 py-3.5 text-sm text-white placeholder-[#9a9a9a]/50 outline-none focus:border-white transition-colors resize-none rounded-none"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-transparent border border-white/30 text-white hover:border-white font-normal py-4 px-6 text-xs uppercase tracking-[0.15em] transition-all cursor-pointer rounded-none"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-white text-[#171717] hover:bg-white/90 font-normal py-4 px-8 text-xs uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center justify-center gap-3 rounded-none disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#171717]" />
                        <span>Memproses Pengajuan...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#171717]" strokeWidth={1.5} />
                        <span>Kirim Permohonan Refund</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: TAMPILAN RESI & STAGE STATUS */}
            {step === 3 && submittedData && (
              <div className="space-y-10 max-w-2xl">
                <div className="p-8 border border-white/30 space-y-6">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={1.5} />
                    <h3 className="text-xl sm:text-2xl font-light tracking-[-0.02em] m-0">
                      Permohonan Refund Berhasil Dicatat
                    </h3>
                  </div>

                  <p className="text-sm font-light text-[#9a9a9a] leading-relaxed m-0">
                    Permohonan pengembalian dana untuk Kode Pesanan <strong className="text-white font-mono">{submittedData.orderCode}</strong> telah tersimpan di sistem verifikasi Finance SymphoniaTic.
                  </p>

                  {/* Resi Table Details */}
                  <div className="border border-white/10 p-6 space-y-4 text-xs font-light">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-[10px] text-[#9a9a9a] uppercase tracking-[0.2em] font-mono">RESI PENGAJUAN</span>
                      <span className="px-2.5 py-1 border border-white/30 text-white text-[10px] font-mono uppercase tracking-widest">
                        [ PENDING REVIEW ]
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex justify-between">
                        <span className="text-[#9a9a9a]">Kode Pesanan:</span>
                        <span className="text-white font-mono">{submittedData.orderCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9a9a9a]">Bank / E-Wallet Tujuan:</span>
                        <span className="text-white">{submittedData.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9a9a9a]">Nomor Rekening:</span>
                        <span className="text-white font-mono">{submittedData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9a9a9a]">Atas Nama Rekening:</span>
                        <span className="text-white">{submittedData.accountHolder}</span>
                      </div>
                    </div>
                  </div>

                  {/* Processing Stages Timeline */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-light text-[#9a9a9a] uppercase tracking-[0.15em] block">
                      Tahapan Pemrosesan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-4 border border-white text-white">
                        <span className="font-mono text-[10px] block text-[#9a9a9a] mb-1">STAGE 01</span>
                        <span className="font-medium block">1. Diterima</span>
                        <span className="text-[10px] text-[#9a9a9a] block mt-1">System Recorded</span>
                      </div>
                      <div className="p-4 border border-white/20 text-[#9a9a9a]">
                        <span className="font-mono text-[10px] block text-[#9a9a9a] mb-1">STAGE 02</span>
                        <span className="font-medium block text-white">2. Peninjauan</span>
                        <span className="text-[10px] block mt-1">1–3 Hari Kerja</span>
                      </div>
                      <div className="p-4 border border-white/10 text-[#9a9a9a]/60">
                        <span className="font-mono text-[10px] block text-[#9a9a9a]/40 mb-1">STAGE 03</span>
                        <span className="font-medium block">3. Pencairan</span>
                        <span className="text-[10px] block mt-1">Transfer Bank</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => { setStep(1); setSubmittedData(null); setOrderCode(''); setUserEmail(''); setOtpCode(''); }}
                      className="bg-transparent border border-white/30 text-white hover:border-white font-normal py-3.5 px-6 text-xs uppercase tracking-[0.15em] cursor-pointer transition-colors rounded-none"
                    >
                      Ajukan Refund Lain
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('status');
                        setLookupCode(submittedData.orderCode);
                        setLookupEmail(userEmail);
                      }}
                      className="bg-white text-[#171717] hover:bg-white/90 font-normal py-3.5 px-6 text-xs uppercase tracking-[0.15em] cursor-pointer transition-colors rounded-none"
                    >
                      Pantau Status Refund
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: CEK STATUS REFUND TIKET */}
        {activeTab === 'status' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-10 max-w-2xl"
          >
            <form onSubmit={handleCheckStatus} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-light text-[#9a9a9a] uppercase tracking-[0.15em]">
                    Kode Pesanan (Order Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SYM-893472"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#171717] border border-white/20 px-4 py-3.5 text-sm font-mono text-white placeholder-[#9a9a9a]/50 outline-none focus:border-white transition-colors rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-light text-[#9a9a9a] uppercase tracking-[0.15em]">
                    Email Pemegang Tiket *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@domain.com"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    className="w-full bg-[#171717] border border-white/20 px-4 py-3.5 text-sm text-white placeholder-[#9a9a9a]/50 outline-none focus:border-white transition-colors rounded-none"
                  />
                </div>
              </div>

              {lookupError && (
                <div className="p-4 border border-white/30 bg-white/[0.03] text-white text-xs font-light flex items-center gap-3 rounded-none">
                  <AlertCircle className="w-4 h-4 shrink-0 text-white/70" strokeWidth={1.5} />
                  <span>{lookupError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full bg-white text-[#171717] hover:bg-white/90 font-normal py-4 px-8 text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 rounded-none"
              >
                {lookupLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#171717]" />
                    <span>Mencari Data Refund...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#171717]" strokeWidth={1.5} />
                    <span>Cek Status Permohonan</span>
                  </>
                )}
              </button>
            </form>

            {/* STATUS RESULT CARD */}
            {statusResult && statusResult.refundDetail && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-white/20 p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
                  <div>
                    <span className="text-[10px] text-[#9a9a9a] uppercase tracking-[0.2em] font-mono block mb-1">
                      KODE PESANAN TIKET
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-mono text-white font-light m-0">
                      {statusResult.refundDetail.orderCode}
                    </h3>
                  </div>

                  {/* Status Badge Tag */}
                  <div>
                    {statusResult.refundDetail.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-white/30 text-white text-xs font-mono uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 text-[#9a9a9a]" strokeWidth={1.5} />
                        <span>[ PENDING REVIEW ]</span>
                      </span>
                    )}
                    {(statusResult.refundDetail.status === 'APPROVED' || statusResult.refundDetail.status === 'COMPLETED') && (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-white text-white bg-white/10 text-xs font-mono uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                        <span>[ REFUND DISETUJUI ]</span>
                      </span>
                    )}
                    {statusResult.refundDetail.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-white/30 text-[#9a9a9a] text-xs font-mono uppercase tracking-widest">
                        <XCircle className="w-3.5 h-3.5 text-[#9a9a9a]" strokeWidth={1.5} />
                        <span>[ PERMOHONAN DITOLAK ]</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Detailed Table Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-light">
                  <div className="space-y-1">
                    <span className="text-[#9a9a9a] block uppercase tracking-[0.15em] text-[10px]">Pertunjukan:</span>
                    <span className="text-white block text-sm font-normal">{statusResult.refundDetail.eventTitle || '-'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#9a9a9a] block uppercase tracking-[0.15em] text-[10px]">Kategori &amp; Kuota Tiket:</span>
                    <span className="text-white block text-sm">{statusResult.refundDetail.categoryName || '-'} ({statusResult.refundDetail.quantity || 1} Tiket)</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#9a9a9a] block uppercase tracking-[0.15em] text-[10px]">Nominal Pengembalian:</span>
                    <span className="text-white font-mono text-lg block font-normal">{formatIDR(statusResult.refundDetail.refundAmount)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#9a9a9a] block uppercase tracking-[0.15em] text-[10px]">Rekening Tujuan:</span>
                    <span className="text-white font-mono block text-sm">{statusResult.refundDetail.bankName} - {statusResult.refundDetail.accountNumber} ({statusResult.refundDetail.accountHolder})</span>
                  </div>
                </div>

                {/* Admin Note if available */}
                {statusResult.refundDetail.adminNote && (
                  <div className="p-5 border border-white/10 text-xs space-y-1.5">
                    <span className="text-[#9a9a9a] uppercase tracking-[0.15em] text-[10px] block">Catatan Tim Finance:</span>
                    <p className="text-white font-light m-0 leading-relaxed">{statusResult.refundDetail.adminNote}</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer Minimalist */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-xs font-light text-[#9a9a9a]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} SymphoniaTic Production. Layanan Refund Tiket Resmi.</span>
          <span className="text-[10px] font-mono tracking-widest text-[#9a9a9a]/70">MIDNIGHT MONOCHROME ATELIER</span>
        </div>
      </footer>
    </div>
  );
};
