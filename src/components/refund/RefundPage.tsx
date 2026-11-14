import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, CheckCircle2, Search, Clock, XCircle, ArrowRight, Info,
  KeyRound, CreditCard, User, RefreshCw, ArrowLeft, ShieldCheck,
} from 'lucide-react';
import { formatIDR } from '../landing/data';
import { Header } from '../landing/Navbar';
import { Footer } from '../landing/Footer';

const BANK_PRESETS = [
  { code: 'BCA', name: 'Bank BCA' },
  { code: 'MANDIRI', name: 'Bank Mandiri' },
  { code: 'BNI', name: 'Bank BNI' },
  { code: 'BRI', name: 'Bank BRI' },
  { code: 'GOPAY', name: 'GoPay' },
  { code: 'OVO', name: 'OVO' },
  { code: 'DANA', name: 'DANA' },
];

export const RefundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'status'>('request');
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [orderCode, setOrderCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [bankName, setBankName] = useState('Bank BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [reason, setReason] = useState('');

  // Status Lookup State
  const [lookupCode, setLookupCode] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [statusResult, setStatusResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Submitted Data
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { getApiBaseUrl } = await import('../landing/data');
      const res = await fetch(`${getApiBaseUrl()}/refunds/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: orderCode.trim().toUpperCase(),
          userEmail: userEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Gagal memproses permohonan OTP.');
      }

      setSuccessMsg(`Kode OTP telah dikirimkan ke email ${userEmail}. Silakan periksa inbox atau Mailpit.`);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat menghubungi backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { getApiBaseUrl } = await import('../landing/data');
      const res = await fetch(`${getApiBaseUrl()}/refunds/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: orderCode.trim().toUpperCase(),
          userEmail: userEmail.trim(),
          otpCode: otpCode.trim(),
          bankName,
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim(),
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Verifikasi OTP gagal atau permohonan ditolak.');
      }

      setSubmittedData({
        orderCode: orderCode.trim().toUpperCase(),
        bankName,
        accountNumber,
        accountHolder,
        amount: data.data?.refundAmount || 0,
        refundId: data.data?.id || '',
      });
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirimkan permohonan refund.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setStatusResult(null);
    setLookupLoading(true);

    try {
      const { getApiBaseUrl } = await import('../landing/data');
      const res = await fetch(`${getApiBaseUrl()}/refunds/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: lookupCode.trim().toUpperCase(),
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
    <div className="min-h-screen bg-[#0C0D12] text-[#FFFFFF] flex flex-col justify-between selection:bg-white selection:text-[#0C0D12] font-sans">
      <Header isScrolled />

      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#14161F] border border-[#272A38] text-xs font-mono text-[#A1A1AA] uppercase tracking-widest">
            <ShieldCheck size={14} className="text-white" />
            <span>Portal Pengembalian Dana Resmi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight max-w-3xl">
            Pengajuan &amp; Pemantauan Refund Tiket
          </h1>

          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            Pengembalian dana dapat diajukan secara langsung tanpa perlu login. Verifikasi keamanan diproses menggunakan kode OTP 6-digit yang dikirim ke email pemesan tiket.
          </p>
        </div>

        <div className="flex items-center gap-8 border-b border-[#272A38] pb-4 mb-10">
          <button
            onClick={() => { setActiveTab('request'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`text-xs sm:text-sm uppercase tracking-[0.15em] pb-4 -mb-[17px] transition-colors cursor-pointer border-b-2 bg-transparent text-left ${
              activeTab === 'request'
                ? 'text-white border-white font-semibold'
                : 'text-[#71717A] hover:text-[#A1A1AA] border-transparent'
            }`}
          >
            01. Ajukan Refund Baru
          </button>
          <button
            onClick={() => { setActiveTab('status'); setLookupError(null); }}
            className={`text-xs sm:text-sm uppercase tracking-[0.15em] pb-4 -mb-[17px] transition-colors cursor-pointer border-b-2 bg-transparent text-left ${
              activeTab === 'status'
                ? 'text-white border-white font-semibold'
                : 'text-[#71717A] hover:text-[#A1A1AA] border-transparent'
            }`}
          >
            02. Pantau Status Refund
          </button>
        </div>

        {activeTab === 'request' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {step < 3 && (
              <div className="flex items-center gap-6 sm:gap-8 border-b border-[#272A38] pb-6 text-xs uppercase tracking-[0.15em]">
                <div className={`flex items-center gap-2.5 ${step >= 1 ? 'text-white font-medium' : 'text-[#71717A]'}`}>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${step >= 1 ? 'border-white text-white' : 'border-[#272A38] text-[#71717A]'}`}>
                    01
                  </span>
                  <span>Validasi Tiket</span>
                </div>
                <span className="text-[#272A38]">/</span>
                <div className={`flex items-center gap-2.5 ${step >= 2 ? 'text-white font-medium' : 'text-[#71717A]'}`}>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${step >= 2 ? 'border-white text-white' : 'border-[#272A38] text-[#71717A]'}`}>
                    02
                  </span>
                  <span>Kode OTP &amp; Transfer Bank</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" strokeWidth={1.5} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && step === 2 && (
              <div className="p-4 rounded-xl border border-white/20 bg-[#14161F] text-white text-xs flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" strokeWidth={1.5} />
                <span>{successMsg}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#A1A1AA]">
                    Kode Pesanan (Order Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SYM-893472"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#14161F] border border-[#272A38] px-4 py-3 text-sm font-mono text-white placeholder-[#71717A] outline-none focus:border-white transition-colors rounded-lg"
                  />
                  <p className="text-[11px] text-[#71717A]">
                    Kode unik transaksi yang tercantum pada E-Ticket resmi SymphoniaTic Anda.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#A1A1AA]">
                    Email Pemegang Tiket *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@domain.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-[#14161F] border border-[#272A38] px-4 py-3 text-sm text-white placeholder-[#71717A] outline-none focus:border-white transition-colors rounded-lg"
                  />
                  <p className="text-[11px] text-[#71717A]">
                    Email yang dimasukkan saat menyelesaikan checkout pemesanan tiket.
                  </p>
                </div>

                <div className="p-5 border border-[#272A38] bg-[#14161F] space-y-3 text-xs text-[#A1A1AA] rounded-xl">
                  <div className="flex items-center gap-2 text-white font-medium uppercase tracking-[0.15em] text-[11px]">
                    <Info className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                    <span>Syarat &amp; Ketentuan Kelayakan Refund:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] text-[#A1A1AA] leading-relaxed">
                    <li>Status pesanan harus dalam status terverifikasi (<strong className="text-white">VERIFIED</strong>).</li>
                    <li>Tiket belum pernah digunakan untuk pemindaian gate check-in di lokasi venue.</li>
                    <li>Proses audit dan pencairan dana dilaksanakan tim Finance dalam 1 hingga 3 hari kerja.</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-neutral-200 font-semibold py-3.5 px-8 text-xs uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center justify-center gap-3 rounded-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Memverifikasi Kode Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-black" strokeWidth={1.5} />
                      <span>Minta Kode Verifikasi OTP Email</span>
                      <ArrowRight className="w-4 h-4 text-black" strokeWidth={1.5} />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmitRefund} className="space-y-6 max-w-xl">
                <div className="p-5 border border-[#272A38] bg-[#14161F] text-left space-y-3 rounded-xl">
                  <label className="block text-xs font-mono uppercase tracking-[0.15em] text-white">
                    Kode Verifikasi OTP (6-Digit) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#0C0D12] border border-[#272A38] px-4 py-3.5 text-2xl font-mono tracking-[0.6em] text-center text-white placeholder-[#71717A] outline-none focus:border-white transition-colors rounded-lg"
                  />
                  <div className="flex justify-between items-center text-[11px] text-[#A1A1AA] pt-1">
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

                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#A1A1AA]">
                    Pilih Bank / E-Wallet Tujuan *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BANK_PRESETS.map((bp) => (
                      <button
                        key={bp.code}
                        type="button"
                        onClick={() => setBankName(bp.name)}
                        className={`py-2.5 px-3 text-xs font-mono border rounded-lg transition-all text-center cursor-pointer ${
                          bankName === bp.name
                            ? 'border-white bg-white text-black font-semibold'
                            : 'border-[#272A38] bg-[#14161F] text-[#A1A1AA] hover:border-white/40 hover:text-white'
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
                    className="w-full bg-[#14161F] border border-[#272A38] px-4 py-3 text-sm text-white placeholder-[#71717A] outline-none focus:border-white transition-colors rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#A1A1AA]">
                      Nomor Rekening / No. E-Wallet *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
                      <input
                        type="text"
                        required
                        placeholder="1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-[#14161F] border border-[#272A38] pl-10 pr-4 py-3 text-sm font-mono text-white placeholder-[#71717A] outline-none focus:border-white transition-colors rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#A1A1AA]">
                      Nama Pemilik Rekening *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
                      <input
                        type="text"
                        required
                        placeholder="Nama sesuai rekening"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className="w-full bg-[#14161F] border border-[#272A38] pl-10 pr-4 py-3 text-sm text-white placeholder-[#71717A] outline-none focus:border-white transition-colors rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#A1A1AA]">
                    Alasan Pembatalan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan catatan alasan permohonan refund..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-[#14161F] border border-[#272A38] px-4 py-3 text-sm text-white placeholder-[#71717A] outline-none focus:border-white transition-colors resize-none rounded-lg"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-transparent border border-white/20 text-white hover:bg-white/10 font-medium py-3.5 px-6 text-xs uppercase tracking-[0.15em] transition-all cursor-pointer rounded-lg"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-white text-black hover:bg-neutral-200 font-semibold py-3.5 px-8 text-xs uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center justify-center gap-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Memproses Pengajuan...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-black" strokeWidth={1.5} />
                        <span>Kirim Permohonan Refund</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && submittedData && (
              <div className="space-y-8 max-w-xl">
                <div className="p-6 sm:p-8 rounded-2xl border border-[#272A38] bg-[#14161F] space-y-6">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={1.5} />
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight m-0">
                      Permohonan Refund Berhasil Dicatat
                    </h3>
                  </div>

                  <p className="text-sm text-[#A1A1AA] leading-relaxed m-0">
                    Permohonan pengembalian dana untuk Kode Pesanan <strong className="text-white font-mono">{submittedData.orderCode}</strong> telah tersimpan di sistem verifikasi Finance SymphoniaTic.
                  </p>

                  <div className="border border-[#272A38] bg-[#0C0D12] rounded-xl p-5 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-[#272A38] pb-3">
                      <span className="text-[10px] text-[#71717A] uppercase tracking-[0.2em] font-mono">RESI PENGAJUAN</span>
                      <span className="px-2.5 py-1 rounded border border-white/20 text-white text-[10px] font-mono uppercase tracking-widest bg-white/5">
                        PENDING REVIEW
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Kode Pesanan:</span>
                        <span className="text-white font-mono">{submittedData.orderCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Bank / E-Wallet Tujuan:</span>
                        <span className="text-white">{submittedData.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Nomor Rekening:</span>
                        <span className="text-white font-mono">{submittedData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Atas Nama Rekening:</span>
                        <span className="text-white">{submittedData.accountHolder}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => { setStep(1); setSubmittedData(null); setOrderCode(''); setUserEmail(''); setOtpCode(''); }}
                      className="bg-transparent border border-white/20 text-white hover:bg-white/10 font-medium py-3 px-6 text-xs uppercase tracking-[0.15em] cursor-pointer transition-colors rounded-lg"
                    >
                      Ajukan Refund Lain
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('status');
                        setLookupCode(submittedData.orderCode);
                        setLookupEmail(userEmail);
                      }}
                      className="bg-white text-black hover:bg-neutral-200 font-semibold py-3 px-6 text-xs uppercase tracking-[0.15em] cursor-pointer transition-colors rounded-lg"
                    >
                      Pantau Status Refund
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'status' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-8 max-w-xl"
          >
            <form onSubmit={handleCheckStatus} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#A1A1AA]">
                    Kode Pesanan (Order Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SYM-893472"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#14161F] border border-[#272A38] px-4 py-3 text-sm font-mono text-white placeholder-[#71717A] outline-none focus:border-white transition-colors rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#A1A1AA]">
                    Email Pemegang Tiket *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@domain.com"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    className="w-full bg-[#14161F] border border-[#272A38] px-4 py-3 text-sm text-white placeholder-[#71717A] outline-none focus:border-white transition-colors rounded-lg"
                  />
                </div>
              </div>

              {lookupError && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" strokeWidth={1.5} />
                  <span>{lookupError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full bg-white text-black hover:bg-neutral-200 font-semibold py-3.5 px-8 text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 rounded-lg"
              >
                {lookupLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Mencari Data Refund...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-black" strokeWidth={1.5} />
                    <span>Cek Status Permohonan</span>
                  </>
                )}
              </button>
            </form>

            {statusResult && statusResult.refundDetail && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#272A38] bg-[#14161F] p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#272A38] pb-6">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase tracking-[0.2em] font-mono block mb-1">
                      KODE PESANAN TIKET
                    </span>
                    <h3 className="text-2xl font-mono text-white font-medium m-0">
                      {statusResult.refundDetail.orderCode}
                    </h3>
                  </div>

                  <div>
                    {statusResult.refundDetail.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/20 text-white text-xs font-mono uppercase tracking-widest bg-white/5">
                        <Clock className="w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.5} />
                        <span>PENDING REVIEW</span>
                      </span>
                    )}
                    {(statusResult.refundDetail.status === 'APPROVED' || statusResult.refundDetail.status === 'COMPLETED') && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white text-black bg-white text-xs font-mono uppercase tracking-widest font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
                        <span>REFUND DISETUJUI</span>
                      </span>
                    )}
                    {statusResult.refundDetail.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded border border-red-500/30 text-red-400 bg-red-500/10 text-xs font-mono uppercase tracking-widest">
                        <XCircle className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />
                        <span>PERMOHONAN DITOLAK</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[#71717A] block uppercase tracking-[0.15em] text-[10px]">Pertunjukan:</span>
                    <span className="text-white block text-sm font-normal">{statusResult.refundDetail.eventTitle || '-'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#71717A] block uppercase tracking-[0.15em] text-[10px]">Kategori &amp; Kuota Tiket:</span>
                    <span className="text-white block text-sm">{statusResult.refundDetail.categoryName || '-'} ({statusResult.refundDetail.quantity || 1} Tiket)</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#71717A] block uppercase tracking-[0.15em] text-[10px]">Nominal Pengembalian:</span>
                    <span className="text-white font-mono text-base block font-medium">{formatIDR(statusResult.refundDetail.refundAmount)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#71717A] block uppercase tracking-[0.15em] text-[10px]">Rekening Tujuan:</span>
                    <span className="text-white font-mono block text-sm">{statusResult.refundDetail.bankName} - {statusResult.refundDetail.accountNumber} ({statusResult.refundDetail.accountHolder})</span>
                  </div>
                </div>

                {statusResult.refundDetail.adminNote && (
                  <div className="p-4 rounded-xl border border-[#272A38] bg-[#0C0D12] text-xs space-y-1.5">
                    <span className="text-[#71717A] uppercase tracking-[0.15em] text-[10px] block">Catatan Tim Finance:</span>
                    <p className="text-[#A1A1AA] m-0 leading-relaxed">{statusResult.refundDetail.adminNote}</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};
