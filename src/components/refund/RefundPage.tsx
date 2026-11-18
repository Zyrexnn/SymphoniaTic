import React, { useState, useId } from 'react';
import {
  AlertCircle, CheckCircle2, Search, Clock, XCircle, ArrowRight, Info,
  KeyRound, CreditCard, User, RefreshCw, ShieldCheck,
} from 'lucide-react';
import { formatIDR } from '../landing/data';
import { Header } from '../landing/Navbar';
import { Footer } from '../landing/Footer';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { fieldInputBase, TextInputField, TextAreaField } from '@/components/ui/form-controls';

const BANK_PRESETS = [
  { code: 'BCA', name: 'Bank BCA' },
  { code: 'MANDIRI', name: 'Bank Mandiri' },
  { code: 'BNI', name: 'Bank BNI' },
  { code: 'BRI', name: 'Bank BRI' },
  { code: 'GOPAY', name: 'GoPay' },
  { code: 'OVO', name: 'OVO' },
  { code: 'DANA', name: 'DANA' },
];

const RefundPageContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'request' | 'status'>('request');
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [orderCode, setOrderCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [bankName, setBankName] = useState('Bank BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [reason, setReason] = useState('');

  const [lookupCode, setLookupCode] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [statusResult, setStatusResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const bankInputId = useId();
  const accountNoId = useId();
  const accountHolderId = useId();

  const handleRequestOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
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

      setSuccessMsg(`Kode OTP telah dikirimkan ke email ${userEmail}. Silakan periksa inbox atau folder spam email Anda.`);
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
      <Header isScrolled user={user} onLogout={logout} />

      <main className="flex-1 max-w-[1160px] w-full mx-auto px-4 sm:px-6 md:px-10 pt-24 sm:pt-28 pb-16">
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight max-w-3xl">
            Pengajuan &amp; Pemantauan Refund Tiket
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            Pengembalian dana dapat diajukan secara langsung tanpa perlu login. Verifikasi keamanan diproses menggunakan kode OTP 6-digit yang dikirim ke email pemesan tiket.
          </p>
        </div>

        <div role="tablist" aria-label="Layanan refund tiket" className="flex items-center gap-4 sm:gap-8 border-b border-[#272A38] mb-8 overflow-x-auto no-scrollbar">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'request'}
            onClick={() => { setActiveTab('request'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`min-h-[44px] text-xs sm:text-sm uppercase tracking-[0.12em] pb-3.5 pt-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'request'
                ? 'text-white border-white font-semibold'
                : 'text-[#A1A1AA] hover:text-white border-transparent'
            }`}
          >
            01. Ajukan Refund Baru
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'status'}
            onClick={() => { setActiveTab('status'); setLookupError(null); }}
            className={`min-h-[44px] text-xs sm:text-sm uppercase tracking-[0.12em] pb-3.5 pt-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'status'
                ? 'text-white border-white font-semibold'
                : 'text-[#A1A1AA] hover:text-white border-transparent'
            }`}
          >
            02. Pantau Status Refund
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            {activeTab === 'request' && (
              <div className="space-y-6">
                {step < 3 && (
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 border-b border-[#272A38] pb-5 text-xs uppercase tracking-[0.12em]">
                    <div className={`flex items-center gap-2.5 ${step >= 1 ? 'text-white font-semibold' : 'text-[#94A3B8]'}`}>
                      <span className={`text-xs font-mono px-2.5 py-0.5 rounded border ${step >= 1 ? 'border-white text-white bg-white/10' : 'border-[#3E4357] text-[#94A3B8]'}`}>
                        01
                      </span>
                      <span>Validasi Tiket</span>
                    </div>
                    <span className="text-[#3E4357]" aria-hidden="true">/</span>
                    <div className={`flex items-center gap-2.5 ${step >= 2 ? 'text-white font-semibold' : 'text-[#94A3B8]'}`}>
                      <span className={`text-xs font-mono px-2.5 py-0.5 rounded border ${step >= 2 ? 'border-white text-white bg-white/10' : 'border-[#3E4357] text-[#94A3B8]'}`}>
                        02
                      </span>
                      <span>OTP &amp; Rekening Transfer</span>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div role="alert" className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-200 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && step === 2 && (
                  <div role="status" className="p-4 rounded-xl border border-white/25 bg-[#14161F] text-white text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-white mt-0.5" aria-hidden="true" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {step === 1 && (
                  <form onSubmit={handleRequestOTP} className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-7 space-y-5">
                    <TextInputField
                      label="Kode Pesanan (Order Code)"
                      required
                      placeholder="Contoh: SYM-893472"
                      value={orderCode}
                      onValueChange={(v) => setOrderCode(v.toUpperCase())}
                      hint="Kode unik transaksi yang tercantum pada E-Ticket resmi SymphoniaTic Anda."
                      className="font-mono uppercase"
                    />

                    <TextInputField
                      label="Email Pemegang Tiket"
                      type="email"
                      required
                      placeholder="nama@domain.com"
                      value={userEmail}
                      onValueChange={setUserEmail}
                      hint="Email yang dimasukkan saat menyelesaikan pemesanan tiket."
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full min-h-[48px] bg-white text-[#0C0D12] hover:bg-neutral-200 font-semibold py-3 px-6 text-sm transition-colors flex items-center justify-center gap-2.5 rounded-lg disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                          <span>Memverifikasi Kode Pesanan...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                          <span>Minta Kode Verifikasi OTP Email</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmitRefund} className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-7 space-y-6">
                    <div className="p-4 border border-[#272A38] bg-[#0C0D12] space-y-3 rounded-xl">
                      <TextInputField
                        label="Kode Verifikasi OTP (6-Digit)"
                        maxLength={6}
                        required
                        placeholder="123456"
                        value={otpCode}
                        onValueChange={(v) => setOtpCode(v.replace(/\D/g, ''))}
                        className="text-xl font-mono tracking-[0.5em] text-center"
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#A1A1AA]">
                        <span>Kode OTP berlaku 10 menit.</span>
                        <button
                          type="button"
                          onClick={() => handleRequestOTP()}
                          className="min-h-[36px] text-white underline hover:opacity-80 bg-transparent border-none p-0 text-left sm:text-right font-medium"
                        >
                          Kirim Ulang OTP
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label htmlFor={bankInputId} className="block text-xs font-medium text-[#E4E4E7]">
                        Bank / E-Wallet Tujuan Pengembalian Dana <span className="text-rose-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {BANK_PRESETS.map((bp) => (
                          <button
                            key={bp.code}
                            type="button"
                            onClick={() => setBankName(bp.name)}
                            className={`min-h-[44px] py-2 px-3 text-xs font-medium border rounded-lg transition-colors text-center ${
                              bankName === bp.name
                                ? 'border-white bg-white text-[#0C0D12] font-semibold'
                                : 'border-[#3E4357] bg-[#0C0D12] text-[#E4E4E7] hover:border-white/60 hover:text-white'
                            }`}
                          >
                            {bp.name}
                          </button>
                        ))}
                      </div>

                      <input
                        id={bankInputId}
                        type="text"
                        required
                        placeholder="Atau tuliskan nama bank lain (Contoh: Bank Danamon)"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className={fieldInputBase}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor={accountNoId} className="block text-xs font-medium text-[#E4E4E7]">
                          Nomor Rekening / E-Wallet <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" strokeWidth={1.7} aria-hidden="true" />
                          <input
                            id={accountNoId}
                            type="text"
                            required
                            placeholder="1234567890"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className={`${fieldInputBase} pl-10 font-mono`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor={accountHolderId} className="block text-xs font-medium text-[#E4E4E7]">
                          Nama Pemilik Rekening <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" strokeWidth={1.7} aria-hidden="true" />
                          <input
                            id={accountHolderId}
                            type="text"
                            required
                            placeholder="Nama sesuai rekening"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            className={`${fieldInputBase} pl-10`}
                          />
                        </div>
                      </div>
                    </div>

                    <TextAreaField
                      label="Alasan Pembatalan (Opsional)"
                      rows={3}
                      placeholder="Tuliskan catatan alasan permohonan refund..."
                      value={reason}
                      onValueChange={setReason}
                    />

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="sm:w-1/3 min-h-[48px] bg-[#0C0D12] border border-[#3E4357] text-white hover:border-white/60 font-medium py-3 px-5 text-sm transition-colors rounded-lg"
                      >
                        Kembali
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="sm:w-2/3 min-h-[48px] bg-white text-[#0C0D12] hover:bg-neutral-200 font-semibold py-3 px-6 text-sm transition-colors flex items-center justify-center gap-2 rounded-lg disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                            <span>Memproses Pengajuan...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                            <span>Kirim Permohonan Refund</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && submittedData && (
                  <div className="p-6 sm:p-8 rounded-2xl border border-[#272A38] bg-[#14161F] space-y-6">
                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight m-0">
                        Permohonan Refund Berhasil Dicatat
                      </h2>
                    </div>

                    <p className="text-sm text-[#A1A1AA] leading-relaxed m-0">
                      Permohonan pengembalian dana untuk Kode Pesanan <strong className="text-white font-mono">{submittedData.orderCode}</strong> telah tersimpan untuk ditinjau tim Finance SymphoniaTic.
                    </p>

                    <div className="border border-[#272A38] bg-[#0C0D12] rounded-xl p-5 space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b border-[#272A38] pb-3">
                        <span className="text-xs text-[#A1A1AA] uppercase tracking-wider font-mono">Resi Pengajuan</span>
                        <span className="px-2.5 py-1 rounded border border-white/25 text-white text-xs font-mono uppercase bg-white/10">
                          PENDING REVIEW
                        </span>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-[#A1A1AA]">Kode Pesanan</span>
                          <span className="text-white font-mono">{submittedData.orderCode}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[#A1A1AA]">Bank / E-Wallet Tujuan</span>
                          <span className="text-white text-right">{submittedData.bankName}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[#A1A1AA]">Nomor Rekening</span>
                          <span className="text-white font-mono">{submittedData.accountNumber}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[#A1A1AA]">Atas Nama Rekening</span>
                          <span className="text-white text-right">{submittedData.accountHolder}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setSubmittedData(null); setOrderCode(''); setUserEmail(''); setOtpCode(''); }}
                        className="min-h-[46px] bg-[#0C0D12] border border-[#3E4357] text-white hover:border-white/60 font-medium py-3 px-6 text-sm transition-colors rounded-lg"
                      >
                        Ajukan Refund Lain
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('status');
                          setLookupCode(submittedData.orderCode);
                          setLookupEmail(userEmail);
                        }}
                        className="min-h-[46px] bg-white text-[#0C0D12] hover:bg-neutral-200 font-semibold py-3 px-6 text-sm transition-colors rounded-lg"
                      >
                        Pantau Status Refund
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'status' && (
              <div className="space-y-6">
                <form onSubmit={handleCheckStatus} className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-7 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInputField
                      label="Kode Pesanan (Order Code)"
                      required
                      placeholder="Contoh: SYM-893472"
                      value={lookupCode}
                      onValueChange={(v) => setLookupCode(v.toUpperCase())}
                      className="font-mono uppercase"
                    />
                    <TextInputField
                      label="Email Pemegang Tiket"
                      type="email"
                      required
                      placeholder="nama@domain.com"
                      value={lookupEmail}
                      onValueChange={setLookupEmail}
                    />
                  </div>

                  {lookupError && (
                    <div role="alert" className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-200 text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
                      <span>{lookupError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="w-full min-h-[48px] bg-white text-[#0C0D12] hover:bg-neutral-200 font-semibold py-3 px-6 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-lg"
                  >
                    {lookupLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Mencari Data Refund...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                        <span>Cek Status Permohonan</span>
                      </>
                    )}
                  </button>
                </form>

                {statusResult && statusResult.refundDetail && (
                  <div className="rounded-2xl border border-[#272A38] bg-[#14161F] p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#272A38] pb-5">
                      <div>
                        <span className="text-xs text-[#A1A1AA] uppercase tracking-wider font-mono block mb-1">
                          Kode Pesanan Tiket
                        </span>
                        <h3 className="text-2xl font-mono text-white font-semibold m-0">
                          {statusResult.refundDetail.orderCode}
                        </h3>
                      </div>

                      <div>
                        {statusResult.refundDetail.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-white/25 text-white text-xs font-mono uppercase bg-white/10">
                            <Clock className="w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.7} aria-hidden="true" />
                            <span>PENDING REVIEW</span>
                          </span>
                        )}
                        {(statusResult.refundDetail.status === 'APPROVED' || statusResult.refundDetail.status === 'COMPLETED') && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-white text-[#0C0D12] bg-white text-xs font-mono uppercase font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
                            <span>REFUND DISETUJUI</span>
                          </span>
                        )}
                        {statusResult.refundDetail.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-rose-500/40 text-rose-300 bg-rose-500/15 text-xs font-mono uppercase">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.8} aria-hidden="true" />
                            <span>PERMOHONAN DITOLAK</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-[#A1A1AA] block text-xs">Pertunjukan</span>
                        <span className="text-white block font-medium">{statusResult.refundDetail.eventTitle || '-'}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#A1A1AA] block text-xs">Kategori &amp; Jumlah</span>
                        <span className="text-white block font-medium">{statusResult.refundDetail.categoryName || '-'} ({statusResult.refundDetail.quantity || 1} Tiket)</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#A1A1AA] block text-xs">Nominal Pengembalian</span>
                        <span className="text-white font-mono text-base block font-semibold">{formatIDR(statusResult.refundDetail.refundAmount)}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#A1A1AA] block text-xs">Rekening Tujuan</span>
                        <span className="text-white font-mono block">{statusResult.refundDetail.bankName} - {statusResult.refundDetail.accountNumber} ({statusResult.refundDetail.accountHolder})</span>
                      </div>
                    </div>

                    {statusResult.refundDetail.adminNote && (
                      <div className="p-4 rounded-xl border border-[#272A38] bg-[#0C0D12] text-sm space-y-1.5">
                        <span className="text-[#A1A1AA] uppercase tracking-wider text-xs block">Catatan Tim Finance</span>
                        <p className="text-[#E4E4E7] m-0 leading-relaxed">{statusResult.refundDetail.adminNote}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="lg:col-span-5 space-y-5">
            <div className="p-5 sm:p-6 border border-[#272A38] bg-[#14161F] space-y-4 rounded-xl">
              <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
                <Info className="w-4 h-4 text-white shrink-0" strokeWidth={1.8} aria-hidden="true" />
                <span>Syarat &amp; Ketentuan Kelayakan Refund</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed list-disc pl-5 m-0">
                <li>
                  Status pesanan harus dalam keadaan aktif (<strong className="text-white">ISSUED</strong>, <strong className="text-white">VERIFIED</strong>, atau <strong className="text-white">REMINDED</strong>).
                </li>
                <li>
                  Tiket belum pernah digunakan untuk pemindaian gate check-in di lokasi venue.
                </li>
                <li>
                  Verifikasi keamanan dilakukan menggunakan kode OTP 6 digit yang dikirim ke email pemesan.
                </li>
                <li>
                  Peninjauan dan pencairan dana ke rekening tujuan dilakukan oleh tim Finance dalam 1 hingga 3 hari kerja.
                </li>
              </ul>
            </div>

            <div className="p-5 sm:p-6 border border-[#272A38] bg-[#14161F] space-y-3 rounded-xl">
              <h2 className="text-sm font-semibold text-white m-0">Butuh Mengecek Kode Pesanan?</h2>
              <p className="text-xs text-[#A1A1AA] leading-relaxed m-0">
                Anda dapat melihat kembali detail tiket dan kode pesanan SYM-XXXXXX di halaman Cek E-Ticket atau Dashboard akun Anda.
              </p>
              <a
                href="/redeem"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#3E4357] bg-[#0C0D12] text-xs font-semibold text-white hover:border-white/60 transition-colors"
              >
                Buka Portal Cek E-Ticket
              </a>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export const RefundPage: React.FC = () => (
  <AuthProvider>
    <RefundPageContent />
  </AuthProvider>
);
