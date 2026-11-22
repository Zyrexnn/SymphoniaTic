import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MapPin,
  Clock,
  ArrowLeft,
  ArrowUpRight,
  Minus,
  Plus,
  Ticket,
  AlertCircle,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Users,
  Sparkles,
} from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR, formatSalesEndLabel } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { BookingModal, ETicketConfirmation } from './Modals';
import { Footer } from './Footer';
import { Header } from './Navbar';
import { parseDate } from './Sections';
import { SectionHeading } from './SectionHeading';
import { ConcertCard } from './ConcertCard';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SeatingPlanVisualizer, getCategoryTierMap } from './SeatingPlanVisualizer';

interface Props {
  eventId: string;
}

const CONCERT_RULES = [
  {
    title: 'Batas Pemesanan Resmi',
    desc: 'Maksimal 4 tiket per akun dalam satu transaksi resmi SymphoniaTic.',
    icon: Ticket,
  },
  {
    title: 'Aturan Berpakaian',
    desc: 'Pengunjung diwajibkan mengenakan busana rapi dan sopan (Smart Casual atau Formal).',
    icon: Sparkles,
  },
  {
    title: 'Ketentuan Usia',
    desc: 'Anak di bawah 7 tahun tidak diperkenankan masuk ke dalam ruang konser demi ketenangan akustik.',
    icon: Users,
  },
  {
    title: 'Registrasi QR & Refund',
    desc: 'Wajib menunjukkan QR E-Ticket di meja Open Gate. Pengajuan pembatalan diproses melalui /refund.',
    icon: ShieldCheck,
  },
];

const isUrl = (str: string): boolean => {
  if (!str) return false;
  return str.startsWith('http://') || str.startsWith('https://');
};

const getCatRemaining = (cat: TicketCategory): number => {
  if (typeof cat?.remainingQuota === 'number') return cat.remainingQuota;
  if (typeof cat?.quota === 'number') return cat.quota;
  return 0;
};

const pickInitialCategoryId = (categories: TicketCategory[], currentId: string): string => {
  if (!categories || categories.length === 0) return '';
  const currentAvailable = categories.find((c) => c.id === currentId && getCatRemaining(c) > 0);
  if (currentAvailable) return currentAvailable.id;
  const firstAvailable = categories.find((c) => getCatRemaining(c) > 0);
  return (firstAvailable || categories[0]).id;
};

const ConcertDetailContent: React.FC<Props> = ({ eventId }) => {
  const { user, logout } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [otherEvents, setOtherEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [bookingCategory, setBookingCategory] = useState<TicketCategory | null>(null);
  const [bookingQuantity, setBookingQuantity] = useState<number>(1);
  const [activeSuccessOrder, setActiveSuccessOrder] = useState<OrderRecord | null>(null);

  const loadEvent = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true);
      try {
        const events = await fetchEventsAPI();
        const pool = events.length > 0 ? events : CONCERT_EVENTS;
        const found = pool.find((e) => String(e.id) === eventId) || CONCERT_EVENTS.find((e) => String(e.id) === eventId) || null;
        if (found) {
          setEvent(found);
          setOtherEvents(pool.filter((e) => String(e.id) !== String(found.id)).slice(0, 3));
          if (found.categories && found.categories.length > 0) {
            setSelectedCatId((prev) => pickInitialCategoryId(found.categories, prev));
          }
        }
      } catch (err) {
        console.error('Failed to load event:', err);
        const staticEvent = CONCERT_EVENTS.find((e) => String(e.id) === eventId) || null;
        if (staticEvent) {
          setEvent(staticEvent);
          setOtherEvents(CONCERT_EVENTS.filter((e) => String(e.id) !== String(staticEvent.id)).slice(0, 3));
          if (staticEvent.categories && staticEvent.categories.length > 0) {
            setSelectedCatId((prev) => pickInitialCategoryId(staticEvent.categories, prev));
          }
        }
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    loadEvent(true);
  }, [loadEvent]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#syarat-ketentuan') {
      setTimeout(() => {
        document.getElementById('syarat-ketentuan')?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    }
  }, [loading]);

  const categories = event?.categories || [];
  const selectedCat = categories.find((c) => c.id === selectedCatId) || categories[0];
  const selectedRemaining = selectedCat ? getCatRemaining(selectedCat) : 0;
  const maxAllowed = Math.min(4, Math.max(0, selectedRemaining));

  useEffect(() => {
    if (maxAllowed > 0 && qty > maxAllowed) {
      setQty(maxAllowed);
    }
  }, [maxAllowed, qty]);

  const openBookingWithCategory = (evt: EventItem, cat: TicketCategory, quantityValue: number = 1) => {
    setBookingEvent(evt);
    setBookingCategory(cat);
    setBookingQuantity(quantityValue);
  };

  const handleBookingSubmit = (order: OrderRecord) => {
    setActiveSuccessOrder(order);
    setBookingEvent(null);
    setBookingCategory(null);
    loadEvent(false);
  };

  const tierMap = useMemo(() => getCategoryTierMap(categories), [categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F3EF] text-[#141413]">
        <Header user={user} onLogout={logout} />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#141413] border-t-[#D4FF2A] animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#52514D]">
              Memuat Informasi Konser...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#F4F3EF] text-[#141413]">
        <Header user={user} onLogout={logout} />
        <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-16">
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-[#141413] mb-3">
            Konser Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#52514D] mb-6 text-center max-w-md">
            Pertunjukan yang Anda cari mungkin telah berakhir atau tautan tidak valid.
          </p>
          <a
            href="/"
            className="min-h-[44px] inline-flex items-center rounded-none bg-[#141413] text-[#D4FF2A] font-bold px-6 py-2.5 text-xs uppercase tracking-wider hover:bg-[#2A2A28] transition-colors"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  const isClosed = !!event.isClosed;
  const isAllSoldOut = categories.length > 0 && categories.every((c) => getCatRemaining(c) <= 0);
  const isSelectedSoldOut = selectedRemaining <= 0;
  const totalPrice = selectedCat ? selectedCat.price * qty : 0;
  const parsed = parseDate(event.date);

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] pb-24 lg:pb-0">
      <Header variant="overlay" user={user} onLogout={logout} />

      {/* Section 1: Dark Stage Hero */}
      <section className="relative bg-[#141413] text-[#F4F3EF] pt-[64px] border-b border-white/15 overflow-hidden">
        <div className="relative mx-auto max-w-[1360px] border-x border-white/15 min-h-[500px] sm:min-h-[580px] flex flex-col justify-between">
          <img
            src={event.image}
            alt={event.title}
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(180deg, rgba(20,20,19,0.72) 0%, rgba(20,20,19,0.38) 42%, rgba(20,20,19,0.94) 100%)',
            }}
          />

          {/* Top Bar inside Hero */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 border-b border-white/15">
            <div className="lg:col-span-7 px-5 sm:px-8 lg:px-10 py-5 flex flex-wrap items-center justify-between gap-3 border-b lg:border-b-0 lg:border-r border-white/15">
              <a
                href="/events"
                className="inline-flex items-center gap-2 rounded-none bg-[#141413]/85 border border-white/25 px-4 py-2 min-h-[44px] text-xs font-bold uppercase tracking-wider text-[#F4F3EF] hover:border-[#D4FF2A] hover:text-[#D4FF2A] transition-colors"
              >
                <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
                <span>Jadwal Konser</span>
              </a>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#141413]/90 border border-white/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F4F3EF]">
                  {event.category}
                </span>
                {parsed.day && (
                  <span className="bg-[#D4FF2A] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#141413] tabular-nums">
                    {parsed.day} {parsed.month} {parsed.year}
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 px-5 sm:px-8 lg:px-10 py-5 bg-[#141413]/70 flex flex-col justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#D8D6CE] tabular-nums">
                <span>{event.date}</span>
                <span>·</span>
                <span>{event.time}</span>
                <span>·</span>
                <span className="truncate">{event.venue}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="#pilih-tiket"
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-none bg-[#D4FF2A] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#141413] hover:bg-[#C2EE1A] transition-colors"
                >
                  <span>Pilih Tiket</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                {isClosed ? (
                  <span className="min-h-[44px] inline-flex items-center px-3.5 border border-white/30 bg-[#141413] text-[11px] font-bold uppercase tracking-wider text-[#F4F3EF]">
                    Penjualan Ditutup
                  </span>
                ) : isAllSoldOut ? (
                  <span className="min-h-[44px] inline-flex items-center px-3.5 bg-[#C81E1E] text-[11px] font-bold uppercase tracking-wider text-white">
                    Tiket Habis
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Bottom Oversized Concert Title */}
          <div className="relative z-10 mt-auto px-5 sm:px-8 lg:px-10 pt-16 pb-8 sm:pb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4FF2A] m-0">
              • {event.artist}
            </p>
            <h1 className="mt-2.5 font-display text-[clamp(36px,6.2vw,84px)] leading-[0.94] tracking-[-0.04em] font-extrabold text-[#F4F3EF] max-w-4xl m-0">
              {event.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Section 2: "Pilih Tiket Anda" (Pick your way in - Flush 3-Column Tier Grid) */}
      <section id="pilih-tiket" className="bg-[#F4F3EF] border-b border-[#DFDDD6] scroll-mt-20">
        <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
          <SectionHeading
            eyebrow="Tiket & Kategori"
            title="Pilih cara Anda menonton."
            support="Pilih kategori kursi dan jumlah tiket untuk langsung melanjutkan ke pemilihan nomor kursi."
          />

          {isClosed && (
            <div
              role="alert"
              className="mb-6 p-4 border border-[#8A5A00] bg-[#8A5A00]/10 text-[#141413] text-xs font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-[#8A5A00] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Penjualan Ditutup:</strong> Pertunjukan ini sudah dimulai atau penjualan tiket telah dihentikan oleh panitia.
              </span>
            </div>
          )}

          {!isClosed && isAllSoldOut && (
            <div
              role="alert"
              className="mb-6 p-4 border border-[#C81E1E] bg-[#C81E1E]/10 text-[#C81E1E] text-xs font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-[#C81E1E] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Seluruh Tiket Habis Terjual:</strong> Semua kategori kursi untuk konser ini telah habis.
              </span>
            </div>
          )}

          {!isClosed && !isAllSoldOut && event.salesEndAt && (
            <div className="mb-6 px-4 py-3 border border-[#DFDDD6] bg-white text-[#52514D] text-xs flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#141413] shrink-0" aria-hidden="true" />
              <span>
                Penjualan online ditutup pada{' '}
                <strong className="text-[#141413]">{formatSalesEndLabel(event.salesEndAt)}</strong>
              </span>
            </div>
          )}

          {/* Flush 3-Column Tier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#DFDDD6] border border-[#DFDDD6]">
            {categories.map((cat, idx) => {
              const rem = getCatRemaining(cat);
              const catSoldOut = rem <= 0;
              const isSelected = selectedCat?.id === cat.id;
              const isDarkTier = idx === 0 && !isSelected && !catSoldOut;
              const tierMeta = tierMap.get(cat.id);
              const catMax = Math.min(4, Math.max(0, rem));

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    if (!isClosed && !catSoldOut) setSelectedCatId(cat.id);
                  }}
                  className={`flex flex-col justify-between p-6 sm:p-8 transition-colors relative ${
                    catSoldOut
                      ? 'bg-[#EAE8E1] text-[#6E6D68]'
                      : isSelected
                      ? 'bg-[#D4FF2A] text-[#141413]'
                      : isDarkTier
                      ? 'bg-[#141413] text-[#F4F3EF] cursor-pointer hover:bg-[#1E1E1C]'
                      : 'bg-white text-[#141413] cursor-pointer hover:bg-[#F9F8F5]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                          isSelected
                            ? 'text-[#141413]'
                            : isDarkTier
                            ? 'text-[#D4FF2A]'
                            : 'text-[#52514D]'
                        }`}
                      >
                        • {tierMeta?.style.zoneLabel || `Kategori 0${idx + 1}`}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${
                          catSoldOut
                            ? 'bg-[#DFDDD6] text-[#6E6D68]'
                            : isSelected
                            ? 'bg-[#141413] text-[#D4FF2A]'
                            : isDarkTier
                            ? 'bg-white/15 text-[#F4F3EF]'
                            : 'bg-[#EAE8E1] text-[#141413]'
                        }`}
                      >
                        {catSoldOut ? 'HABIS' : `Sisa ${rem}`}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.035em] leading-[1.02] m-0">
                      {cat.name}
                    </h3>

                    <p
                      className={`mt-2.5 text-xs leading-relaxed m-0 ${
                        isSelected
                          ? 'text-[#141413]/85'
                          : isDarkTier
                          ? 'text-[#B8B6AE]'
                          : 'text-[#52514D]'
                      }`}
                    >
                      {(cat.benefits || []).slice(0, 3).join(' · ') || 'Akses masuk gedung pertunjukan sesuai zona kursi.'}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-current/15">
                    <div className="flex items-end justify-between gap-3 mb-5">
                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-[0.14em] block ${
                            isSelected
                              ? 'text-[#141413]/75'
                              : isDarkTier
                              ? 'text-[#B8B6AE]'
                              : 'text-[#6E6D68]'
                          }`}
                        >
                          Harga per tiket
                        </span>
                        <span className="font-display text-2xl sm:text-3xl font-extrabold tabular-nums tracking-[-0.03em] block mt-0.5">
                          {formatIDR(cat.price)}
                        </span>
                      </div>

                      {isSelected && !isClosed && !catSoldOut && (
                        <div
                          className="flex items-center border border-[#141413] bg-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            disabled={qty <= 1}
                            aria-label="Kurangi jumlah tiket"
                            className="h-11 w-11 flex items-center justify-center text-[#141413] hover:bg-[#EAE8E1] disabled:opacity-35"
                          >
                            <Minus size={14} strokeWidth={2.2} aria-hidden="true" />
                          </button>
                          <span className="min-w-[34px] text-center font-mono text-sm font-bold text-[#141413] tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(Math.min(catMax, qty + 1))}
                            disabled={qty >= catMax}
                            aria-label="Tambah jumlah tiket"
                            className="h-11 w-11 flex items-center justify-center text-[#141413] hover:bg-[#EAE8E1] disabled:opacity-35"
                          >
                            <Plus size={14} strokeWidth={2.2} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isClosed || catSoldOut ? (
                      <button
                        type="button"
                        disabled
                        className="w-full min-h-[46px] rounded-none border border-[#DFDDD6] bg-[#EAE8E1] text-[#6E6D68] text-xs font-bold uppercase tracking-wider"
                      >
                        {isClosed ? 'Penjualan Ditutup' : 'Kuota Habis'}
                      </button>
                    ) : isSelected ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openBookingWithCategory(event, cat, qty);
                        }}
                        className="w-full min-h-[46px] rounded-none bg-[#141413] text-[#D4FF2A] hover:bg-[#2A2A28] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                      >
                        <span>Pesan · {formatIDR(cat.price * qty)}</span>
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCatId(cat.id);
                        }}
                        className={`w-full min-h-[46px] rounded-none border text-xs font-bold uppercase tracking-wider transition-colors ${
                          isDarkTier
                            ? 'border-white/30 bg-transparent text-[#F4F3EF] hover:bg-[#D4FF2A] hover:text-[#141413] hover:border-[#D4FF2A]'
                            : 'border-[#141413] bg-transparent text-[#141413] hover:bg-[#141413] hover:text-[#D4FF2A]'
                        }`}
                      >
                        Pilih Kategori Ini
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Editorial Synopsis Split */}
      <section className="bg-[#F4F3EF] border-b border-[#DFDDD6]">
        <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0">
                <span className="inline-block w-1.5 h-1.5 bg-[#141413]" aria-hidden="true" />
                <span>Catatan Program</span>
              </p>
              <div className="aspect-[4/3] w-full max-w-[260px] bg-[#141413] overflow-hidden chamfer-br">
                <img
                  src={event.image}
                  alt={event.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-[#52514D] m-0">
                Penyelenggara: <strong className="text-[#141413]">{event.organizer}</strong>
              </p>
            </div>

            <div className="lg:col-span-8">
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-[-0.035em] leading-[1.06] text-[#141413] m-0">
                Menampilkan karya pilihan bersama{' '}
                <span className="bg-[#D4FF2A] text-[#141413] px-1.5 py-0.5">
                  {event.artist}.
                </span>
              </h2>
              <p className="mt-5 text-sm sm:text-base text-[#52514D] leading-[1.75] max-w-2xl m-0">
                {event.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Dark Band - "Di Atas Panggung" (Who's on stage) */}
      <section className="bg-[#141413] text-[#F4F3EF] border-b border-white/15">
        <div className="mx-auto max-w-[1360px] border-x border-white/15 px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
          <SectionHeading
            eyebrow="Di Atas Panggung"
            title="Ansambel & Konduktor"
            support="Profil penampil utama, pengarah musik, dan detail tata panggung untuk pertunjukan ini."
            dark
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] w-full bg-[#1C1C1A] overflow-hidden chamfer-br border border-white/15">
                <img
                  src={event.image}
                  alt={event.artist}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.035em] text-[#F4F3EF] m-0">
                  {event.artist}
                </h3>
                <p className="mt-2 text-sm text-[#B8B6AE] leading-relaxed max-w-xl m-0">
                  {event.conductor && event.conductor !== '-'
                    ? `Dipimpin oleh konduktor dan pengarah musik ${event.conductor} di panggung utama ${event.venue}.`
                    : `Tampil penuh dengan tata akustik gedung konser di ${event.venue}.`}
                </p>
              </div>

              <div className="mt-8 border-t border-white/15">
                {[
                  { label: 'Orkestra / Solois', value: event.artist },
                  { label: 'Konduktor', value: event.conductor || 'Pengarah Musik Tetap' },
                  { label: 'Penyelenggara', value: event.organizer },
                  { label: 'Kategori', value: event.category },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-12 gap-4 py-3.5 border-b border-white/15 text-xs sm:text-sm"
                  >
                    <span className="col-span-5 text-[#B8B6AE] font-medium">{row.label}</span>
                    <span className="col-span-7 text-[#F4F3EF] font-semibold text-right sm:text-left">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: "Rangkaian Acara" (How the night runs - Hairline Timetable) */}
      <section className="bg-[#F4F3EF] border-b border-[#DFDDD6]">
        <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
          <SectionHeading
            eyebrow="Rangkaian Acara"
            title="Alur malam pertunjukan."
            support={`Open Gate dibuka pada ${event.openGate}. Harap tiba minimal 30 menit sebelum pintu ditutup.`}
          />

          <div className="border-t border-[#141413]">
            {(event.rundown && event.rundown.length > 0
              ? event.rundown
              : [
                  { time: event.openGate || '18:30 WIB', activity: 'Registrasi QR & Pembukaan Pintu Aula' },
                  { time: event.time || '19:30 WIB', activity: `Pertunjukan Utama: ${event.title}` },
                ]
            ).map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 py-4 sm:py-5 border-b border-[#DFDDD6] items-baseline hover:bg-white/70 px-2 transition-colors"
              >
                <span className="sm:col-span-3 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#141413] tabular-nums">
                  {item.time}
                </span>
                <span className="sm:col-span-6 text-sm sm:text-base font-bold text-[#141413]">
                  {item.activity}
                </span>
                <span className="sm:col-span-3 text-xs text-[#6E6D68] sm:text-right">
                  {event.venue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Venue, Interactive Seating Plan & "Sebelum Anda Datang" */}
      <section className="bg-[#F4F3EF] border-b border-[#DFDDD6]">
        <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
          <SectionHeading
            eyebrow="Gedung & Denah Kursi"
            title={event.venue}
            support="Periksa lokasi gedung konser serta zona denah kursi yang terhubung dengan kategori pilihan Anda."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-14">
            <div className="lg:col-span-7 space-y-6">
              <div className="w-full h-[260px] border border-[#DFDDD6] overflow-hidden bg-white">
                <iframe
                  title="Peta Lokasi Venue Konser"
                  width="100%"
                  height="260"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={
                    event.googleMapsUrl ||
                    (isUrl(event.address)
                      ? `https://maps.google.com/maps?q=${encodeURIComponent(event.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                      : `https://maps.google.com/maps?q=${encodeURIComponent(event.venue + ' ' + event.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`)
                  }
                />
              </div>

              <SeatingPlanVisualizer
                eventId={String(event.id)}
                venue={event.venue}
                categories={categories}
                selectedCategoryId={selectedCatId}
                quantity={qty}
                onSelectCategory={(cat) => setSelectedCatId(cat.id)}
                compact
              />
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="border border-[#DFDDD6] bg-white p-6 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] block">
                  • Informasi Lokasi
                </span>
                <div className="space-y-3 text-xs sm:text-sm border-t border-[#DFDDD6] pt-4">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="shrink-0 mt-0.5 text-[#141413]" aria-hidden="true" />
                    <div>
                      <strong className="block text-[#141413]">{event.venue}</strong>
                      {event.address && !isUrl(event.address) && (
                        <span className="text-[#52514D] block mt-0.5">{event.address}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 tabular-nums text-[#52514D]">
                    <Calendar size={15} className="shrink-0 text-[#141413]" aria-hidden="true" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2.5 tabular-nums text-[#52514D]">
                    <Clock size={15} className="shrink-0 text-[#141413]" aria-hidden="true" />
                    <span>Mulai {event.time} (Open Gate {event.openGate})</span>
                  </div>
                </div>

                <a
                  href={
                    event.googleMapsUrl ||
                    (isUrl(event.address)
                      ? event.address
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + ' ' + event.address)}`)
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase text-[#141413] bg-[#F4F3EF] border border-[#141413] px-4 py-2.5 hover:bg-[#141413] hover:text-[#D4FF2A] transition-colors"
                >
                  <span>Buka di Google Maps</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>

              <div className="border border-[#DFDDD6] bg-white p-6 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] block">
                  • Fasilitas Kategori Terpilih
                </span>
                <p className="font-display text-xl font-extrabold tracking-tight text-[#141413] m-0">
                  {selectedCat?.name || 'Kategori Kursi'}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(selectedCat?.benefits || []).map((b, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium text-[#141413] bg-[#EAE8E1] border border-[#DFDDD6] px-2.5 py-1"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* "Sebelum Anda Datang" (Before you go 2x2 Grid) */}
          <div id="syarat-ketentuan" className="scroll-mt-24 pt-10 border-t border-[#DFDDD6]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4">
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0">
                  <span className="inline-block w-1.5 h-1.5 bg-[#141413]" aria-hidden="true" />
                  <span>Tata Tertib</span>
                </p>
                <h3 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.035em] text-[#141413] m-0">
                  Sebelum Anda datang
                </h3>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#DFDDD6] border border-[#DFDDD6]">
                {CONCERT_RULES.map((rule) => {
                  const Icon = rule.icon;
                  return (
                    <div key={rule.title} className="bg-white p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-2 text-[#141413]">
                        <Icon size={15} strokeWidth={2} aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {rule.title}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#52514D] leading-relaxed m-0">
                        {rule.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Organizer Strip & "Pertunjukan Lainnya" */}
      {otherEvents.length > 0 && (
        <section className="bg-[#F4F3EF]">
          <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
            <div className="mb-12 border border-[#DFDDD6] bg-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 bg-[#141413] text-[#D4FF2A] font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                  S.
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E6D68] m-0">
                    Penyelenggara Resmi
                  </p>
                  <p className="text-sm font-bold text-[#141413] truncate m-0">
                    {event.organizer}
                  </p>
                </div>
              </div>
              <a
                href="/events"
                className="min-h-[44px] inline-flex items-center gap-2 bg-[#141413] text-[#F4F3EF] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#D4FF2A] hover:text-[#141413] transition-colors"
              >
                <span>Semua Pertunjukan</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>

            <SectionHeading
              eyebrow="Pertunjukan Lainnya"
              title="Agenda serupa musim ini"
              support="Temukan jadwal orkestra, resital piano, dan konser kamar lainnya."
              actionLabel="Lihat Katalog"
              actionHref="/events"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#DFDDD6] border border-[#DFDDD6]">
              {otherEvents.map((ev) => (
                <ConcertCard
                  key={ev.id}
                  event={ev}
                  onBuyTicket={(target) => {
                    const cat = target.categories?.[0];
                    if (cat) openBookingWithCategory(target, cat, 1);
                  }}
                  className="border-0"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Sticky Quick Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#141413] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
          <div className="min-w-0 flex-1">
            <span className="text-xs text-[#52514D] font-medium block leading-tight truncate">
              {qty} tiket &middot; {selectedCat ? selectedCat.name : ''}
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#141413] tabular-nums tracking-tight block truncate">
              {formatIDR(totalPrice)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => selectedCat && openBookingWithCategory(event, selectedCat, qty)}
            disabled={isClosed || isSelectedSoldOut || isAllSoldOut || !selectedCat}
            className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-none px-4 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider min-h-[46px] transition-colors ${
              isClosed || isSelectedSoldOut || isAllSoldOut || !selectedCat
                ? 'bg-[#EAE8E1] border border-[#DFDDD6] text-[#6E6D68]'
                : 'bg-[#D4FF2A] text-[#141413] border border-[#141413] hover:bg-[#C2EE1A]'
            }`}
          >
            {isClosed ? (
              <span>Ditutup</span>
            ) : isAllSoldOut || isSelectedSoldOut ? (
              <span>KUOTA HABIS</span>
            ) : (
              <>
                <Ticket size={15} strokeWidth={2} aria-hidden="true" />
                <span>Pesan Tiket</span>
              </>
            )}
          </button>
        </div>
      </div>

      {bookingEvent && bookingCategory && (
        <BookingModal
          event={bookingEvent}
          initialCategory={bookingCategory}
          initialQuantity={bookingQuantity}
          onClose={() => {
            setBookingEvent(null);
            setBookingCategory(null);
          }}
          onSubmit={handleBookingSubmit}
        />
      )}

      {activeSuccessOrder && (
        <ETicketConfirmation
          order={activeSuccessOrder}
          onClose={() => setActiveSuccessOrder(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export const ConcertDetailPage: React.FC<Props> = (props) => (
  <AuthProvider>
    <ConcertDetailContent {...props} />
  </AuthProvider>
);

export default ConcertDetailPage;
