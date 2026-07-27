import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Menu, X, BarChart3, Heart, Ticket, Calendar, 
  MapPin, CheckCircle2, QrCode, User, Mail, ChevronRight,
  Pause, Sparkles, ShieldCheck, Flame, ArrowDown,
  Layers, Lock, Search, Info, Clock, AlertCircle, Share2,
  Music, ExternalLink, Filter, HelpCircle, Disc, Check, Radio
} from 'lucide-react';
import { BoomerangVideoBg } from './BoomerangVideoBg';

interface TicketCategory {
  id: string;
  name: string;
  price: number;
  quota: number;
  benefits: string[];
}

interface RundownItem {
  time: string;
  activity: string;
}

interface EventItem {
  id: number;
  title: string;
  subtitle: string;
  artist: string;
  conductor: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  openGate: string;
  category: string;
  categoryBadgeColor: string;
  image: string;
  organizer: string;
  description: string;
  rundown: RundownItem[];
  categories: TicketCategory[];
}

const CONCERT_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Symphony No. 9 in D minor",
    subtitle: "Opus 125 — Ode to Joy Choral Masterpiece",
    artist: "Royal Philharmonic Orchestra & Jakarta Choral Society",
    conductor: "Maestro Alexander Vance",
    venue: "Aula Simfonia Jakarta",
    address: "Jl. Industri Blok B14 No.1, Kemayoran, Jakarta Pusat 10720",
    date: "Sabtu, 18 April 2026",
    time: "19:30 WIB",
    openGate: "18:00 WIB",
    category: "SIMFONI",
    categoryBadgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    organizer: "Royal Philharmonic Foundation & SymphoniaTic Events",
    description: "Mahakarya simfoni terakhir Ludwig van Beethoven yang legendaris. Menampilkan gerakan pamungkas 'Ode to Joy' dengan kolaborasi megah 90 musisi orkestra simfoni dan 80 penyanyi paduan suara profesional. Pengalaman akustik tak tertandingi di hall bertaraf internasional.",
    rundown: [
      { time: "18:00 WIB", activity: "Pemeriksaan E-Ticket & Registrasi Open Gate" },
      { time: "19:00 WIB", activity: "Pintu Main Hall Dibuka & Pre-Concert Presentation" },
      { time: "19:30 WIB", activity: "Babak I: Movement I (Allegro) & Movement II (Molto vivace)" },
      { time: "20:30 WIB", activity: "Istirahat / Intermission (20 Menit)" },
      { time: "20:50 WIB", activity: "Babak II: Movement III (Adagio) & Movement IV (Ode to Joy Finale)" },
      { time: "21:45 WIB", activity: "Selesai & Sesi Foto Konduktor" }
    ],
    categories: [
      { 
        id: "c1-vip", 
        name: "VIP Orchestral Pit", 
        price: 750000, 
        quota: 14,
        benefits: ["Baris Depan Tengah", "Welcome Drink & Cocktail Lounge", "Buku Program Eksklusif", "Meet & Greet Konduktor"]
      },
      { 
        id: "c1-cat1", 
        name: "CAT 1 Grand Tier", 
        price: 450000, 
        quota: 24,
        benefits: ["Balkon Tengah Akustik Jernih", "Tempat Duduk Bernomor", "Digital Event Guide"]
      },
      { 
        id: "c1-fest", 
        name: "Festival Stalls", 
        price: 300000, 
        quota: 50,
        benefits: ["Lantai Utama View Langsung", "Tempat Duduk Teratur"]
      },
    ]
  },
  {
    id: 2,
    title: "The Four Seasons: Recomposed",
    subtitle: "Mahakarya Antonio Vivaldi Diberi Sentuhan Neoklasik Modern",
    artist: "Vivaldi & Max Richter Ensemble",
    conductor: "Violinis Utama Iskandar Widjaja",
    venue: "TIM Concert Hall (Taman Ismail Marzuki)",
    address: "Jl. Cikini Raya No.73, Menteng, Jakarta Pusat",
    date: "Minggu, 19 April 2026",
    time: "20:00 WIB",
    openGate: "18:30 WIB",
    category: "KAMAR MUSIK",
    categoryBadgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    organizer: "Jakarta Chamber Society & Max Richter Music",
    description: "Reinterpretasi kontemporer atas karya abad ke-18 Vivaldi oleh komposer ternama Max Richter. Perpaduan harmonis antara gesekan biola klasik yang dramatis dengan elemen synthesizer ambient modern.",
    rundown: [
      { time: "18:30 WIB", activity: "Open Gate & Registrasi Ulang E-Ticket" },
      { time: "19:30 WIB", activity: "Pengenalan Karya & Pengantar Neoklasik" },
      { time: "20:00 WIB", activity: "Pertunjukan Musim Semi & Musim Panas" },
      { time: "21:00 WIB", activity: "Pertunjukan Musim Gugur & Musim Dingin" },
      { time: "22:00 WIB", activity: "Penutupan & Sesi Tanya Jawab Musik" }
    ],
    categories: [
      { 
        id: "c2-vip", 
        name: "VIP Front Row", 
        price: 850000, 
        quota: 5,
        benefits: ["Baris Utama Depan Panggung", "Merchandise Kaos Eksklusif", "Akses VIP Lounge"]
      },
      { 
        id: "c2-cat1", 
        name: "CAT 1 Main Hall", 
        price: 500000, 
        quota: 120,
        benefits: ["Area Utama Hall", "Pandangan Jelas Ke Musisi"]
      },
    ]
  },
  {
    id: 3,
    title: "Swan Lake & Nutcracker Suite",
    subtitle: "Pertunjukan Balet Simfoni Kolosal Pyotr Tchaikovsky",
    artist: "Grand Opera Orchestra & Jakarta Ballet Company",
    conductor: "Maestro David Chen",
    venue: "JIExpo Symphony Hall",
    address: "Gedung Pusat Niaga Pekan Raya Jakarta, Kemayoran, Jakarta Pusat",
    date: "Jumat, 24 April 2026",
    time: "19:00 WIB",
    openGate: "17:30 WIB",
    category: "BALET & OPERA",
    categoryBadgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    organizer: "Indonesian Classical Ballet Theatre",
    description: "Nikmati keindahan tarian balet anggun diiringi live orchestra penuh membawakan lagu-lagu abadi Tchaikovsky seperti Danau Angsa dan Tarian Peri Gula.",
    rundown: [
      { time: "17:30 WIB", activity: "Open Gate & Booth Merchandise Balet" },
      { time: "19:00 WIB", activity: "Babak I: Swan Lake Act 1 & 2" },
      { time: "20:15 WIB", activity: "Istirahat (15 Menit)" },
      { time: "20:30 WIB", activity: "Babak II: Nutcracker Suite Highlights" },
      { time: "21:30 WIB", activity: "Penutupan & Curtain Call" }
    ],
    categories: [
      { 
        id: "c3-vip", 
        name: "Royal Box VIP", 
        price: 600000, 
        quota: 8,
        benefits: ["Balkon Khusus Royal Box", "Foto Bersama Prima Ballerina", "Snack Box Premium"]
      },
      { 
        id: "c3-cat1", 
        name: "CAT 1 Balcony", 
        price: 350000, 
        quota: 12,
        benefits: ["Perspektif Panorama Atas", "Kursi Empuk Busa"]
      },
    ]
  },
  {
    id: 4,
    title: "Requiem in D minor, K. 626",
    subtitle: "Misa Pemakaman Suci Wolfgang Amadeus Mozart",
    artist: "Vienna Choir Soloists & Nusantara Philharmonic",
    conductor: "Conductor Dr. Helena Sutanto",
    venue: "Aula Simfonia Jakarta",
    address: "Jl. Industri Blok B14 No.1, Kemayoran, Jakarta Pusat",
    date: "Sabtu, 25 April 2026",
    time: "21:00 WIB",
    openGate: "19:30 WIB",
    category: "PADUAN SUARA",
    categoryBadgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
    organizer: "Nusantara Classical Arts",
    description: "Karya sakral terakhir Mozart yang penuh misteri dan keagungan spiritual. Dibawakan oleh 4 solois vokal internasional, paduan suara koral megah, dan orkestra kamar.",
    rundown: [
      { time: "19:30 WIB", activity: "Open Gate & Suasana Hening Hall" },
      { time: "21:00 WIB", activity: "Introitus, Kyrie, & Sequentia (Dies Irae)" },
      { time: "21:50 WIB", activity: "Offertorium, Sanctus, Benedictus, & Agnus Dei" },
      { time: "22:45 WIB", activity: "Selesai" }
    ],
    categories: [
      { 
        id: "c4-vip", 
        name: "Chamber VIP", 
        price: 700000, 
        quota: 15,
        benefits: ["Baris VIP Akustik Murni", "Souvenir Booklet Edisi Terbatas"]
      },
      { 
        id: "c4-cat1", 
        name: "CAT 1 Circle", 
        price: 400000, 
        quota: 45,
        benefits: ["Area Samping Melingkar", "Pengalaman Suara Mendalam"]
      },
    ]
  },
  {
    id: 5,
    title: "Piano Concerto No. 2 in C minor",
    subtitle: "Opus 18 — Konser Piano Romantis Sergei Rachmaninoff",
    artist: "Concertgebouw Soloists & Pianis Ananda Sukarlan",
    conductor: "Maestro Julian Rossi",
    venue: "Balai Sarbini Concert Hall",
    address: "Plaza Semanggi, Jl. Jend. Sudirman Kav 50, Jakarta Selatan",
    date: "Minggu, 26 April 2026",
    time: "19:30 WIB",
    openGate: "18:00 WIB",
    category: "RESITAL PIANO",
    categoryBadgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1200&q=80",
    organizer: "Steinway Society Indonesia",
    description: "Salah satu konser piano paling emosional dan penuh keahlian teknis tinggi di dunia. Dimainkan di atas piano Steinway & Sons Concert Grand Model D terbaru.",
    rundown: [
      { time: "18:00 WIB", activity: "Registrasi Ulang & Open Lounge" },
      { time: "19:30 WIB", activity: "Pembuka: Prelude in C-sharp minor" },
      { time: "20:00 WIB", activity: "Piano Concerto No. 2 (Movement 1, 2, & 3)" },
      { time: "21:30 WIB", activity: "Selesai & Sesi CD Signing" }
    ],
    categories: [
      { 
        id: "c5-vip", 
        name: "Stage VIP", 
        price: 650000, 
        quota: 10,
        benefits: ["Posisi Tangan Pianis Terlihat Jelas", "Buku Foto Pianis Tanda Tangan"]
      },
      { 
        id: "c5-cat1", 
        name: "CAT 1 Seats", 
        price: 375000, 
        quota: 18,
        benefits: ["Area Tengah Balai Sarbini", "Pemandangan Nyaman"]
      },
    ]
  },
  {
    id: 6,
    title: "Scheherazade Op. 35",
    subtitle: "Suite Simfoni 1001 Malam Karya Nikolai Rimsky-Korsakov",
    artist: "London Symphony Orchestra",
    conductor: "Conductor Elena Rostova",
    venue: "Bengkel Symphony Space Bali",
    address: "Kawasan Pariwisata ITDC Nusa Dua, Lot 5, Bali",
    date: "Kamis, 30 April 2026",
    time: "20:30 WITA",
    openGate: "19:00 WITA",
    category: "PHILHARMONIC",
    categoryBadgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    organizer: "Bali International Philharmonic Festival",
    description: "Petualangan kisah dongeng 1001 Malam yang disajikan dalam balutan alunan instrumen orkestra mewah di auditorium terbuka berlatar pemandangan alam Nusa Dua.",
    rundown: [
      { time: "19:00 WITA", activity: "Open Gate & Sunset Welcoming Music" },
      { time: "20:30 WITA", activity: "Babak I: Lautan & Kapal Sinbad" },
      { time: "21:30 WITA", activity: "Babak II: Pangeran Kalendar & Pesta Baghdad" },
      { time: "22:30 WITA", activity: "Selesai" }
    ],
    categories: [
      { 
        id: "c6-vip", 
        name: "VIP Amphitheater", 
        price: 550000, 
        quota: 20,
        benefits: ["Tempat Duduk Terdepan Undercover", "Welcome Wine / Juice"]
      },
      { 
        id: "c6-cat1", 
        name: "CAT 1 Open Lawn", 
        price: 325000, 
        quota: 60,
        benefits: ["Tikar Karpet Sintetis Nyaman", "Suasana Konser Terbuka"]
      },
    ]
  }
];

const ARTISTS_LINEUP = [
  {
    name: "Royal Philharmonic Orchestra",
    genre: "Orkestra Simfoni Utama",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80",
    shows: "12 Konser Musim Ini"
  },
  {
    name: "Vienna Choir Soloists",
    genre: "Paduan Suara Koral & Opera",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80",
    shows: "8 Pertunjukan Mandiri"
  },
  {
    name: "Max Richter & Chamber Group",
    genre: "Neoklasik & Musik Ambient",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
    shows: "6 Tur Spesial"
  },
  {
    name: "London Symphony Orchestra",
    genre: "Simfoni Internasional",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=500&q=80",
    shows: "15 Jadwal Dunia"
  }
];

const FAQS = [
  {
    q: "Bagaimana cara mendapatkan E-Ticket setelah melakukan pemesanan?",
    a: "Setelah Anda mengonfirmasi pesanan tiket di web SymphoniaTic, sistem secara otomatis menerbitkan kode pesanan unik (contoh: SYM-893472) dan E-Ticket resmi yang dilengkapi Kode QR (QR-SYM-XXXXX). Anda dapat melihat dan menyimpan E-Ticket kapan saja di menu 'E-Ticket Saya'."
  },
  {
    q: "Berapa jumlah maksimal tiket yang dapat dibeli dalam 1 transaksi?",
    a: "Sesuai dengan aturan kuota resmi SymphoniaTic untuk mencegah percaloan, setiap transaksi dibatasi maksimal 4 tiket per akun/identitas pemesan."
  },
  {
    q: "Apakah E-Ticket perlu dicetak saat datang ke lokasi acara?",
    a: "Tidak perlu. Anda cukup menunjukkan gambar Kode QR E-Ticket langsung dari layar smartphone Anda di pintu masuk (Open Gate) untuk dipindai oleh pemindai petugas gate."
  },
  {
    q: "Bagaimana aturan pakaian (dress code) untuk konser simfoni?",
    a: "Pengunjung dianjurkan menggunakan pakaian Rapi & Sopan (Smart Casual, Batik, Formal, atau Gaun Malam). Tidak diperkenankan menggunakan celana pendek atau sandal jepit."
  }
];

interface OrderRecord {
  orderCode: string;
  eventTitle: string;
  artist: string;
  venue: string;
  date: string;
  categoryName: string;
  quantity: number;
  totalPrice: number;
  userName: string;
  userEmail: string;
  qrCode: string;
  status: 'PENDING' | 'VERIFIED';
  expiresAt: string;
}

export const SymphoniaTicApp: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('SEMUA');

  // Modals & Drawers
  const [activeDrawer, setActiveDrawer] = useState<'ORDERS' | 'ADMIN' | null>(null);
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedCat, setSelectedCat] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Active Tab in Detail Modal
  const [detailTab, setDetailTab] = useState<'INFO' | 'RUNDOWN' | 'BENEFITS' | 'TERMS'>('INFO');

  // Orders
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeSuccessOrder, setActiveSuccessOrder] = useState<OrderRecord | null>(null);

  const navPages = [
    { label: 'Jelajah Konser', href: '#concerts' },
    { label: 'Artis & Lineup', href: '#lineup' },
    { label: 'Sistem Kuota', href: '#ticket-war' },
    { label: 'Panduan E-Ticket', href: '#guide' },
    { label: 'FAQ', href: '#faq' },
  ];

  // Filtering Logic
  const filteredEvents = CONCERT_EVENTS.filter((event) => {
    const matchesCategory = selectedCategoryFilter === 'SEMUA' || event.category === selectedCategoryFilter;
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedCat || !userName || !userEmail) return;

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderCode = `SYM-${randomNum}`;
    const qrCode = `QR-SYM-${orderCode}`;

    const newOrder: OrderRecord = {
      orderCode,
      eventTitle: selectedEvent.title,
      artist: selectedEvent.artist,
      venue: selectedEvent.venue,
      date: `${selectedEvent.date} @ ${selectedEvent.time}`,
      categoryName: selectedCat.name,
      quantity,
      totalPrice: selectedCat.price * quantity,
      userName,
      userEmail,
      qrCode,
      status: 'VERIFIED',
      expiresAt: '30 Menit'
    };

    setOrders([newOrder, ...orders]);
    setActiveSuccessOrder(newOrder);
    setSelectedEvent(null);
    setSelectedCat(null);
    setQuantity(1);
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07080c] text-white select-none">
      {/* -------------------- 1. HERO VIEWPORT SECTION -------------------- */}
      <div className="relative h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Background Boomerang Video */}
        <BoomerangVideoBg />

        {/* Gradient Overlay for Crisp Text Readability */}
        <div className="absolute inset-0 z-5 bg-gradient-to-b from-black/60 via-black/30 to-[#07080c]" />

        {/* Header Navigation */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Brand Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-blue-400/30">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-none">
                  SymphoniaTic
                </span>
                <span className="text-[10px] text-blue-400 font-mono tracking-wider">PLATFORM TIKET RESMI</span>
              </div>
            </a>

            {/* Desktop Nav links */}
            <nav className="hidden md:flex items-center gap-2 liquid-glass px-4 py-1.5 rounded-full border border-white/10">
              {navPages.map((page) => (
                <a
                  key={page.label}
                  href={page.href}
                  className="text-xs font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  {page.label}
                </a>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveDrawer('ADMIN')}
                className="hidden sm:flex text-xs text-blue-300 border border-blue-500/30 px-3.5 py-1.5 rounded-xl hover:bg-blue-950/60 transition-all cursor-pointer items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Metrik Admin</span>
              </button>

              <button 
                onClick={() => setActiveDrawer('ORDERS')}
                className="rounded-xl bg-white p-1 pr-3.5 sm:pr-4 flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer shadow-xl"
              >
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                  <span className="hidden sm:inline">E-Ticket </span>({orders.length})
                </span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="liquid-glass h-9 w-9 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer md:hidden"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-4.5 h-4.5 text-white" />
                ) : (
                  <Menu className="w-4.5 h-4.5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          {isMenuOpen && (
            <div className="mt-3 md:hidden liquid-glass mx-4 rounded-2xl p-2.5 flex flex-col gap-1 z-30 border border-white/10 shadow-2xl">
              {navPages.map((page) => (
                <a
                  key={page.label}
                  href={page.href}
                  className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {page.label}
                </a>
              ))}
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveDrawer('ADMIN');
                }}
                className="rounded-xl px-4 py-3 text-sm text-blue-400 hover:bg-blue-950/40 text-left font-semibold flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Portal Metrik Admin</span>
              </button>
            </div>
          )}
        </header>

        {/* Hero Content */}
        <main className="relative z-10 flex flex-col items-center text-center pt-28 sm:pt-36 md:pt-40 px-4 sm:px-6 max-w-4xl mx-auto">
          {/* Status Badge */}
          <div
            className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white mb-6 animate-fade-up delay-1 flex items-center gap-2 border border-white/20 shadow-lg"
            style={{ background: 'rgba(255, 255, 255, 0.08)' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium tracking-wide">Penjualan Tiket Konser Musim Semi 2026 Resmi Dibuka</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12] text-white tracking-tight animate-fade-up delay-2 font-normal">
            Nikmati Harmoni Konser
            <br />
            Orkestra & Simfoni Terbaik.
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-gray-200 animate-fade-up delay-3 font-normal">
            SymphoniaTic adalah platform pemesanan tiket resmi untuk pertunjukan simfoni, orkestra philharmonic, opera, dan resital klasik di Indonesia. Dapatkan kepastian nomor kursi dan akses E-Ticket QR Code instan.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto animate-fade-up delay-4">
            <a 
              href="#concerts"
              className="rounded-xl bg-white px-8 py-3 text-sm text-gray-900 font-semibold hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto text-center cursor-pointer shadow-2xl flex items-center justify-center gap-2"
            >
              <span>Jelajahi Konser & Beli Tiket</span>
              <ArrowDown className="w-4 h-4" />
            </a>
            <button 
              onClick={() => {
                setDetailEvent(CONCERT_EVENTS[0]);
              }}
              className="liquid-glass rounded-xl px-7 py-3 text-sm text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto text-center cursor-pointer flex items-center justify-center gap-2 border border-white/20"
            >
              <Info className="w-4 h-4 text-blue-400" />
              <span>Detail Konser Beethoven</span>
            </button>
          </div>
        </main>

        {/* Audio Player Floating Widget */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-10 z-20 w-[290px] sm:w-80 animate-fade-up delay-5">
          <div className="rounded-2xl bg-white/95 backdrop-blur-md p-3 pr-4 shadow-2xl flex items-center gap-3 border border-white/40">
            <div className="relative">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="h-11 w-11 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer shadow-md"
              >
                {isPlayingAudio ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
                )}
              </button>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-xs font-bold text-gray-900 truncate">
                Beethoven — Symphony No. 9
              </p>
              <p className="text-[10px] text-blue-700 font-semibold truncate">Cuplikan Pre-Show Resital</p>
              <div className="mt-1.5 h-1 w-full rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full bg-blue-600 rounded-full transition-all duration-300 ${isPlayingAudio ? 'w-[75%]' : 'w-[25%]'}`} />
              </div>
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="h-8 w-8 shrink-0 rounded-full bg-gray-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 text-blue-600 transition-colors ${
                  isLiked ? 'fill-blue-600' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* -------------------- 2. LANDING PAGE SECTIONS -------------------- */}

      {/* SECTION A: KATALOG KONSER */}
      <section id="concerts" className="relative z-10 py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="liquid-glass inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs text-blue-400 mb-3 border border-blue-500/30 font-medium">
              <Ticket className="w-3.5 h-3.5" />
              <span>JADWAL PERTUNJUKAN RESMI 2026</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white">
              Katalog Konser Simfoni & Tiket
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-xl">
              Pilih pertunjukan favorit Anda. Setiap kuota tempat duduk dialokasikan secara transparan dan terverifikasi instan.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari nama konser, artis, atau lokasi venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {[
            { id: 'SEMUA', label: 'Semua Kategori' },
            { id: 'SIMFONI', label: 'Simfoni Utama' },
            { id: 'KAMAR MUSIK', label: 'Kamar Musik' },
            { id: 'BALET & OPERA', label: 'Balet & Opera' },
            { id: 'PADUAN SUARA', label: 'Paduan Suara' },
            { id: 'RESITAL PIANO', label: 'Resital Piano' },
            { id: 'PHILHARMONIC', label: 'Philharmonic' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategoryFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'liquid-glass text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Concert Cards Grid */}
        {filteredEvents.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-gray-400 my-8">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">Konser Tidak Ditemukan</p>
            <p className="text-xs text-gray-400 mt-1">Coba kata kunci lain atau pilih kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const minPrice = event.categories[0].price;
              const totalQuotaLeft = event.categories.reduce((acc, c) => acc + c.quota, 0);

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={event.id}
                  className="liquid-glass liquid-glass-card rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between group shadow-xl"
                >
                  {/* Concert Banner */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f121d] via-[#0f121d]/40 to-transparent" />
                    
                    <div className="absolute top-3.5 left-3.5">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border backdrop-blur-md uppercase tracking-wider ${event.categoryBadgeColor}`}>
                        {event.category}
                      </span>
                    </div>

                    {totalQuotaLeft <= 20 && (
                      <div className="absolute top-3.5 right-3.5 bg-red-950/80 backdrop-blur-md text-red-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-red-500/40 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400 animate-pulse" />
                        <span>Sisa {totalQuotaLeft} Tiket</span>
                      </div>
                    )}
                  </div>

                  {/* Concert Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-normal text-white group-hover:text-blue-400 transition-colors leading-snug">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-300 mt-1 font-medium">{event.artist}</p>

                      <div className="mt-4 space-y-2 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{event.date} • {event.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Harga Mulai</span>
                        <span className="text-base font-bold text-white">
                          {formatIDR(minPrice)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setDetailEvent(event)}
                          className="liquid-glass p-2.5 rounded-xl text-gray-300 hover:text-white transition-all cursor-pointer border border-white/10"
                          title="Lihat Detail Acara"
                        >
                          <Info className="w-4 h-4 text-blue-400" />
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedEvent(event);
                            setSelectedCat(event.categories[0]);
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>Beli Tiket</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION B: ARTIS & LINEUP */}
      <section id="lineup" className="relative z-10 py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="liquid-glass inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs text-blue-400 mb-3 border border-blue-500/30 font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>SOLOIS & ORKESTRA RESMI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white">
            Jajaran Musikus & Orkestra Dunia
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Diisi oleh konduktor ternama, solois biola/piano bertalenta tinggi, serta himpunan simfoni papan atas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARTISTS_LINEUP.map((art, idx) => (
            <div key={idx} className="liquid-glass rounded-3xl p-6 border border-white/10 hover:border-blue-500/40 transition-all text-center group">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-blue-500/40 group-hover:scale-105 transition-transform duration-300 shadow-xl">
                <img src={art.image} alt={art.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-base font-semibold text-white">{art.name}</h4>
              <p className="text-xs text-blue-400 mt-0.5 font-medium">{art.genre}</p>
              <span className="inline-block mt-3 text-[10px] text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {art.shows}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION C: METRIK PROTEKSI TRANSAKSI */}
      <section id="ticket-war" className="relative z-10 py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="liquid-glass liquid-glass-accent rounded-3xl p-8 md:p-12 border border-blue-500/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-900/60 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-700/40 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>TRANSAKSI ATOMIC DENGAN ROW LOCKING</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal text-white">
                Keamanan & Kepastian Kuota Tiket
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                SymphoniaTic mengintegrasikan transaksi basis data Go-Fiber dengan mekanisme penguncian <code className="text-blue-400 font-mono">FOR UPDATE</code>. Setiap kuota yang dibeli dijamin tidak mengalami alokasi ganda (*overbooking*) walaupun dipesan bersamaan.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Total Pendapatan Terverifikasi</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 block">Rp 485.500.000</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Tiket Terjual</span>
                <span className="text-xl sm:text-2xl font-bold text-white mt-1 block">1.420 / 1.708 Tiket</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Sisa Kuota Aktif</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-400 mt-1 block">288 Kursi</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Tingkat Pemindaian Gate</span>
                <span className="text-xl sm:text-2xl font-bold text-purple-400 mt-1 block">99,8% Akurat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: PANDUAN E-TICKET */}
      <section id="guide" className="relative z-10 py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-normal tracking-tight text-white">Panduan Pemesanan & Akses Masuk</h2>
          <p className="text-sm text-gray-400 mt-2">3 langkah mudah mendapatkan tiket resmi hingga memasuki hall konser.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="liquid-glass rounded-3xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-base mb-4">
              1
            </div>
            <h4 className="text-base font-semibold text-white">Pilih Konser & Kategori</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Tentukan pertunjukan dan pilihan kategori tempat duduk (VIP, CAT 1, atau Festival). Maksimal 4 tiket dalam satu transaksi.
            </p>
          </div>

          <div className="liquid-glass rounded-3xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-base mb-4">
              2
            </div>
            <h4 className="text-base font-semibold text-white">Verifikasi Transaksi Instan</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Isi nama lengkap dan email Anda. Sistem langsung menerbitkan kode transaksi sah dan memverifikasi kuota secara aman.
            </p>
          </div>

          <div className="liquid-glass rounded-3xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-base mb-4">
              3
            </div>
            <h4 className="text-base font-semibold text-white">Tunjukkan E-Ticket Kode QR</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Simpan E-Ticket ber-Kode QR <code className="text-blue-400">QR-SYM</code> di menu 'E-Ticket Saya' dan tunjukkan di pintu masuk hall.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION E: FAQ / TANYA JAWAB */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto border-t border-white/10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="liquid-glass inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-blue-400 mb-3 border border-blue-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>PERTANYAAN UMUM</span>
          </div>
          <h2 className="text-3xl font-normal tracking-tight text-white">Tanya Jawab Pengunjung</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-2">
              <h4 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-blue-400">Q.</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 md:px-12 border-t border-white/10 bg-[#050609] text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">SymphoniaTic</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
            <a href="#concerts" className="hover:text-white transition-colors">Jelajah Konser</a>
            <a href="#lineup" className="hover:text-white transition-colors">Artis</a>
            <a href="#ticket-war" className="hover:text-white transition-colors">Proteksi Kuota</a>
            <a href="#guide" className="hover:text-white transition-colors">Panduan</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <p>© 2026 SymphoniaTic Events Inc. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

      {/* -------------------- 3. MODAL DETAIL CONCERT (LENGKAP) -------------------- */}
      <AnimatePresence>
        {detailEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-[#0f121d] text-white rounded-3xl overflow-hidden border border-white/15 shadow-2xl my-8 relative flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setDetailEvent(null)}
                className="absolute top-4 right-4 z-20 liquid-glass p-2.5 rounded-full text-white hover:bg-white/20 transition-all cursor-pointer border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Banner */}
              <div className="relative h-64 sm:h-72 w-full shrink-0">
                <img 
                  src={detailEvent.image} 
                  alt={detailEvent.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f121d] via-[#0f121d]/60 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border backdrop-blur-md ${detailEvent.categoryBadgeColor}`}>
                    {detailEvent.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 leading-tight">
                    {detailEvent.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-300 mt-1 font-medium">
                    {detailEvent.subtitle}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs in Detail Modal */}
              <div className="flex border-b border-white/10 px-6 bg-gray-950/60 shrink-0 overflow-x-auto no-scrollbar">
                {[
                  { id: 'INFO', label: 'Informasi & Lokasi' },
                  { id: 'RUNDOWN', label: 'Rangkaian Acara' },
                  { id: 'BENEFITS', label: 'Kategori & Benefit' },
                  { id: 'TERMS', label: 'Syarat & Ketentuan' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`py-3.5 px-4 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      detailTab === tab.id
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* TAB 1: INFO & LOKASI */}
                {detailTab === 'INFO' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Deskripsi Mahakarya</h4>
                      <p className="text-gray-300 leading-relaxed text-xs">
                        {detailEvent.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 block uppercase font-medium">Penyelenggara</span>
                        <span className="text-white font-medium block">{detailEvent.organizer}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 block uppercase font-medium">Konduktor & Solois</span>
                        <span className="text-white font-medium block">{detailEvent.conductor}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 block uppercase font-medium">Jadwal Tanggal</span>
                        <span className="text-white font-medium block">{detailEvent.date}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 block uppercase font-medium">Waktu Konser</span>
                        <span className="text-white font-medium block">{detailEvent.time} (Open Gate {detailEvent.openGate})</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span>Detail Lokasi Venue</span>
                      </h4>
                      <p className="text-white font-semibold text-xs">{detailEvent.venue}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{detailEvent.address}</p>
                    </div>
                  </div>
                )}

                {/* TAB 2: RANGKAIAN ACARA (RUNDOWN) */}
                {detailTab === 'RUNDOWN' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>Rangkaian Acara (Rundown Konser)</span>
                    </h4>

                    <div className="space-y-3">
                      {detailEvent.rundown.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-3.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="font-mono text-blue-400 font-bold shrink-0 w-20 text-xs">{item.time}</span>
                          <span className="text-gray-200 font-medium text-xs">{item.activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: KATEGORI & BENEFIT */}
                {detailTab === 'BENEFITS' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Pilihan Kategori Tiket & Benefit Kursi</h4>

                    <div className="space-y-3">
                      {detailEvent.categories.map((cat) => (
                        <div key={cat.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{cat.name}</span>
                            <span className="font-bold text-blue-400 text-sm">{formatIDR(cat.price)}</span>
                          </div>

                          <span className="text-[10px] text-emerald-400 block font-semibold">Sisa Kuota: {cat.quota} Tempat Duduk</span>

                          <div className="pt-2 border-t border-white/5 space-y-1">
                            <span className="text-[10px] text-gray-400 block font-medium">Fasilitas Termasuk:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {cat.benefits.map((b, i) => (
                                <span key={i} className="bg-blue-950/60 text-blue-200 text-[10px] px-2.5 py-0.5 rounded-full border border-blue-800/40">
                                  ✓ {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: SYARAT & KETENTUAN */}
                {detailTab === 'TERMS' && (
                  <div className="space-y-3 text-gray-300 text-xs">
                    <h4 className="text-sm font-semibold text-white mb-2">Syarat & Ketentuan Pembelian Tiket</h4>
                    <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                      <li>Setiap akun/identitas pemesan hanya diperbolehkan membeli **maksimal 4 tiket** dalam 1 transaksi resmi.</li>
                      <li>Pengunjung wajib menggunakan **pakaian Rapi & Sopan** (Smart Casual / Formal). Pengunjung berpakaian celana pendek atau sandal jepit tidak diizinkan masuk.</li>
                      <li>Anak-anak berusia di bawah 7 tahun tidak diperkenankan memasuki arena pertunjukan simfoni.</li>
                      <li>E-Ticket resmi ber-Kode QR <code className="text-blue-400 font-mono">QR-SYM</code> wajib ditunjukkan dari smartphone pada saat registrasi Open Gate di lokasi.</li>
                      <li>Tiket yang sudah dibeli tidak dapat ditukarkan uang tunai (*non-refundable*), namun dapat dipindahtangankan dengan konfirmasi data identitas.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 bg-gray-950 border-t border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Harga Mulai Dari</span>
                  <span className="text-base font-bold text-white">
                    {formatIDR(detailEvent.categories[0].price)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDetailEvent(null)}
                    className="px-4 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white transition-all"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(detailEvent);
                      setSelectedCat(detailEvent.categories[0]);
                      setDetailEvent(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Lanjut Pesan Tiket</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------- 4. SEAT SELECTION & BOOKING MODAL -------------------- */}
      {selectedEvent && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#0f121d] text-white rounded-3xl p-6 border border-white/15 shadow-2xl relative my-6"
          >
            <button 
              onClick={() => {
                setSelectedEvent(null);
                setSelectedCat(null);
              }}
              className="absolute top-4 right-4 liquid-glass p-2 rounded-xl text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold">Pilih Tempat Duduk & Tiket</h3>
            </div>
            <p className="text-xs text-blue-300 mt-1 font-semibold">{selectedEvent.title}</p>

            {/* SEAT MAP PREVIEW WIDGET */}
            <div className="my-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="text-center bg-blue-600/30 text-blue-300 py-1.5 rounded-lg border border-blue-500/40 text-[10px] font-bold tracking-widest uppercase">
                ▲ STAGE / PANGGUNG UTAMA ORKESTRA ▲
              </div>

              {/* Seating Layout Visual */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold">
                <div 
                  onClick={() => setSelectedCat(selectedEvent.categories[0])}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedCat.name === selectedEvent.categories[0]?.name
                      ? 'border-blue-500 bg-blue-600/30 text-white shadow-lg'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold">VIP Pit</div>
                  <div className="text-[9px] text-blue-400 mt-0.5">Depan Tengah</div>
                </div>

                <div 
                  onClick={() => setSelectedCat(selectedEvent.categories[1] || selectedEvent.categories[0])}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedCat.name === selectedEvent.categories[1]?.name
                      ? 'border-blue-500 bg-blue-600/30 text-white shadow-lg'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold">CAT 1</div>
                  <div className="text-[9px] text-blue-400 mt-0.5">Balkon Utama</div>
                </div>

                <div 
                  onClick={() => setSelectedCat(selectedEvent.categories[2] || selectedEvent.categories[0])}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedCat.name === selectedEvent.categories[2]?.name
                      ? 'border-blue-500 bg-blue-600/30 text-white shadow-lg'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold">Festival</div>
                  <div className="text-[9px] text-blue-400 mt-0.5">Lantai Utama</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Category Select */}
              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1.5">Kategori Yang Dipilih</label>
                <div className="grid grid-cols-1 gap-2">
                  {selectedEvent.categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCat(cat)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selectedCat.id === cat.id
                          ? 'border-blue-500 bg-blue-950/50 text-white shadow-md'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">{cat.name}</div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">Sisa {cat.quota} kursi kuota</div>
                      </div>
                      <div className="font-bold text-white">{formatIDR(cat.price)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Picker (Max 4 per PRD rule) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-gray-300 font-medium">Jumlah Tiket</label>
                  <span className="text-[10px] text-blue-400 font-semibold">Batas PRD: Maks. 4 tiket/transaksi</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setQuantity(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        quantity === num
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {num} Tiket
                    </button>
                  ))}
                </div>
              </div>

              {/* User Name & Email */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 font-medium block mb-1">Nama Lengkap Pemesan</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-300 font-medium block mb-1">Alamat Email Aktif</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="budi@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Order Total & Submit */}
              <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-medium">Total Pembayaran</span>
                  <span className="text-base font-bold text-white">
                    {formatIDR(selectedCat.price * quantity)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Konfirmasi & Terbitkan Pass
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* -------------------- 5. E-TICKET CONFIRMATION RESULT -------------------- */}
      {activeSuccessOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#0f121d] text-white rounded-3xl p-6 border border-blue-500/40 shadow-2xl text-center relative"
          >
            <button 
              onClick={() => setActiveSuccessOrder(null)}
              className="absolute top-4 right-4 liquid-glass p-2 rounded-xl text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mt-3">E-Ticket Resmi Terbit!</h3>
            <p className="text-xs text-gray-400 mt-0.5">Kode Order: <span className="font-mono text-blue-400 font-bold">{activeSuccessOrder.orderCode}</span></p>

            {/* QR Code Container */}
            <div className="my-5 p-4 bg-white rounded-2xl max-w-[200px] mx-auto shadow-inner flex flex-col items-center">
              <QrCode className="w-32 h-32 text-gray-900" />
              <span className="text-[10px] font-mono text-gray-800 mt-2 font-bold tracking-wider">
                {activeSuccessOrder.qrCode}
              </span>
            </div>

            <div className="text-left bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Nama Konser:</span>
                <span className="text-white font-semibold truncate max-w-[170px]">{activeSuccessOrder.eventTitle}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Kategori Kursi:</span>
                <span className="text-white font-semibold">{activeSuccessOrder.categoryName} ({activeSuccessOrder.quantity}x)</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Bayar:</span>
                <span className="text-emerald-400 font-bold">{formatIDR(activeSuccessOrder.totalPrice)}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveSuccessOrder(null)}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Simpan & Selesai
            </button>
          </motion.div>
        </div>
      )}

      {/* -------------------- 6. MY E-TICKETS DRAWER -------------------- */}
      {activeDrawer === 'ORDERS' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-md bg-[#0f121d] text-white h-full flex flex-col p-6 overflow-y-auto border-l border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold tracking-tight">E-Ticket Aktif Saya</h2>
              </div>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="liquid-glass p-2 rounded-xl text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <Ticket className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-sm font-semibold text-white">Belum Ada E-Ticket</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Anda belum memesan tiket konser. Jelajahi katalog konser dan dapatkan tempat duduk terbaik Anda!
                </p>
                <a
                  href="#concerts"
                  onClick={() => setActiveDrawer(null)}
                  className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all inline-block shadow-lg"
                >
                  Jelajahi Konser
                </a>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {orders.map((ord, idx) => (
                  <div key={idx} className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-blue-400 font-bold">{ord.orderCode}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                        {ord.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{ord.eventTitle}</h4>
                    <p className="text-xs text-gray-300">{ord.artist}</p>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Kategori</span>
                        <span className="text-white font-medium">{ord.categoryName} ({ord.quantity}x)</span>
                      </div>
                      <button
                        onClick={() => setActiveSuccessOrder(ord)}
                        className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Tampilkan QR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* -------------------- 7. ADMIN METRICS DRAWER -------------------- */}
      {activeDrawer === 'ADMIN' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-md bg-[#0f121d] text-white h-full flex flex-col p-6 overflow-y-auto border-l border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold tracking-tight">Portal Metrik Admin</h2>
              </div>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="liquid-glass p-2 rounded-xl text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-1">
                <span className="text-gray-400 font-medium">Rest API Endpoint:</span>
                <p className="font-mono text-blue-400 font-semibold">GET /api/v1/admin/dashboard</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-medium">Total Pendapatan</span>
                  <span className="text-base font-bold text-emerald-400">Rp 485.500.000</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-medium">Tiket Terjual</span>
                  <span className="text-base font-bold text-white">1.420</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-medium">Sisa Kuota Kursi</span>
                  <span className="text-base font-bold text-blue-400">288</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-medium">Perlu Verifikasi</span>
                  <span className="text-base font-bold text-amber-400">12 Order</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="font-bold text-white">Proteksi Transaksi Basis Data</h4>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Setiap verifikasi pesanan mengeksekusi <code className="text-blue-400 font-mono">db.Begin()</code> dengan penguncian <code className="text-blue-400 font-mono">FOR UPDATE</code> untuk mencegah alokasi ganda kuota saat lonjakan pembelian tiket.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
