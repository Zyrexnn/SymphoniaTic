import React, { useState } from 'react';
import { 
  ShoppingCart, Menu, X, BarChart3, Heart, Ticket, Calendar, 
  MapPin, CheckCircle2, QrCode, User, Mail, ChevronRight,
  Pause, Sparkles, ShieldCheck, Flame, ArrowDown,
  Layers, Lock
} from 'lucide-react';
import { BoomerangVideoBg } from './BoomerangVideoBg';

interface TicketCategory {
  id: string;
  name: string;
  price: number;
  quota: number;
}

interface EventItem {
  id: number;
  title: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  category: string;
  image: string;
  categories: TicketCategory[];
}

const CONCERT_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Symphony No. 9 in D minor",
    artist: "Beethoven • Royal Philharmonic Orchestra",
    venue: "GBK Grand Hall, Jakarta",
    date: "SAT 18 APR 2026",
    time: "7:30 PM",
    category: "SYMPHONY",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    categories: [
      { id: "c1-vip", name: "VIP Orchestral Pit", price: 750000, quota: 14 },
      { id: "c1-cat1", name: "CAT 1 Grand Tier", price: 450000, quota: 24 },
      { id: "c1-fest", name: "Festival Stalls", price: 300000, quota: 50 },
    ]
  },
  {
    id: 2,
    title: "The Four Seasons: Recomposed",
    artist: "Vivaldi & Max Richter • Chamber Soloists",
    venue: "TIM Concert Hall, Jakarta",
    date: "SUN 19 APR 2026",
    time: "8:00 PM",
    category: "CHAMBER MUSIC",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    categories: [
      { id: "c2-vip", name: "VIP Front Row", price: 850000, quota: 5 },
      { id: "c2-cat1", name: "CAT 1 Main Hall", price: 500000, quota: 120 },
    ]
  },
  {
    id: 3,
    title: "Swan Lake & Nutcracker Suite",
    artist: "Tchaikovsky • Grand Opera Orchestra",
    venue: "JIExpo Symphony Hall, Jakarta",
    date: "FRI 24 APR 2026",
    time: "7:00 PM",
    category: "BALLET & OPERA",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    categories: [
      { id: "c3-vip", name: "Royal Box VIP", price: 600000, quota: 8 },
      { id: "c3-cat1", name: "CAT 1 Balcony", price: 350000, quota: 12 },
    ]
  },
  {
    id: 4,
    title: "Requiem in D minor, K. 626",
    artist: "Mozart • Vienna Choir & Philharmonic",
    venue: "Aula Simfonia, Jakarta",
    date: "SAT 25 APR 2026",
    time: "9:00 PM",
    category: "CHORAL & ORCHESTRA",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    categories: [
      { id: "c4-vip", name: "Chamber VIP", price: 700000, quota: 15 },
      { id: "c4-cat1", name: "CAT 1 Circle", price: 400000, quota: 45 },
    ]
  },
  {
    id: 5,
    title: "Piano Concerto No. 2 in C minor",
    artist: "Rachmaninoff • Concertgebouw Soloists",
    venue: "Taman Ismail Marzuki, Jakarta",
    date: "SUN 26 APR 2026",
    time: "7:30 PM",
    category: "PIANO RECITALS",
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80",
    categories: [
      { id: "c5-vip", name: "Stage VIP", price: 650000, quota: 10 },
      { id: "c5-cat1", name: "CAT 1 Seats", price: 375000, quota: 18 },
    ]
  },
  {
    id: 6,
    title: "Scheherazade Op. 35",
    artist: "Rimsky-Korsakov • London Symphony",
    venue: "Bengkel Symphony Space, Bali",
    date: "THU 30 APR 2026",
    time: "8:30 PM",
    category: "PHILHARMONIC",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    categories: [
      { id: "c6-vip", name: "VIP Amphitheater", price: 550000, quota: 20 },
      { id: "c6-cat1", name: "CAT 1 Open Lawn", price: 325000, quota: 60 },
    ]
  }
];

const ARTISTS_LINEUP = [
  {
    name: "Royal Philharmonic Orchestra",
    genre: "Symphony & Classical",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80",
    shows: "12 Concerts"
  },
  {
    name: "Vienna Choir & Philharmonic",
    genre: "Choral & Opera",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80",
    shows: "8 Concerts"
  },
  {
    name: "Max Richter & Chamber Soloists",
    genre: "Neoclassical & Ambient",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
    shows: "6 Concerts"
  },
  {
    name: "London Symphony Orchestra",
    genre: "Grand Symphony",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=500&q=80",
    shows: "15 Concerts"
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
  
  // Modals & Drawers
  const [activeDrawer, setActiveDrawer] = useState<'SHELVES' | 'ORDERS' | 'ADMIN' | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedCat, setSelectedCat] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Orders
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeSuccessOrder, setActiveSuccessOrder] = useState<OrderRecord | null>(null);

  const navPages = [
    { label: 'Concerts', href: '#concerts' },
    { label: 'Lineup', href: '#lineup' },
    { label: 'Ticket War', href: '#ticket-war' },
    { label: 'How It Works', href: '#guide' },
  ];

  const filteredEvents = selectedCategoryFilter === 'ALL'
    ? CONCERT_EVENTS
    : CONCERT_EVENTS.filter(e => e.category === selectedCategoryFilter);

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
      expiresAt: '30 mins'
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
    <div className="relative min-h-screen w-full bg-black text-white select-none">
      {/* -------------------- 1. HERO VIEWPORT SECTION -------------------- */}
      <div className="relative h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Background Boomerang Video */}
        <BoomerangVideoBg />

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 group">
              <svg
                viewBox="0 0 256 256"
                className="w-6 h-6 fill-white transition-transform duration-200 group-hover:scale-105"
              >
                <path d="M 256 256 L 128 256 C 198.692 256 256 198.692 256 128 C 256 57.308 198.692 0 128 0 C 57.308 0 0 57.308 0 128 C 0 198.692 57.308 256 128 256 L 0 256 L 0 0 L 256 0 Z M 128 104 C 141.255 104 152 114.745 152 128 C 152 141.255 141.255 152 128 152 C 114.745 152 104 141.255 104 128 C 104 114.745 114.745 104 128 104 Z" />
              </svg>
              <span className="text-lg tracking-tight text-white font-normal">
                SymphoniaTic
              </span>
            </a>

            {/* Desktop Nav links (Ganti nama page disesuaikan) */}
            <nav className="hidden md:flex items-center gap-8">
              {navPages.map((page) => (
                <a
                  key={page.label}
                  href={page.href}
                  className="text-sm text-white/90 hover:text-white transition-colors duration-200"
                >
                  {page.label}
                </a>
              ))}
              <button 
                onClick={() => setActiveDrawer('ADMIN')}
                className="text-xs text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full hover:bg-blue-950/50 transition-all cursor-pointer"
              >
                Admin Metrics
              </button>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* My Tickets Button */}
              <button 
                onClick={() => setActiveDrawer('ORDERS')}
                className="rounded-xl bg-white p-1 pr-3 sm:pr-4 flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer shadow-lg"
              >
                <div className="h-7 w-7 rounded-lg bg-blue-700 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  <span className="hidden sm:inline">My Pass </span>({orders.length})
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
            <div className="mt-3 md:hidden liquid-glass mx-4 rounded-2xl p-2 flex flex-col gap-1 z-30">
              {navPages.map((page) => (
                <a
                  key={page.label}
                  href={page.href}
                  className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors duration-200"
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
                className="rounded-xl px-4 py-3 text-sm text-blue-400 hover:bg-blue-950/40 text-left font-medium"
              >
                Admin Metrics Dashboard
              </button>
            </div>
          )}
        </header>

        {/* Hero Content */}
        <main className="relative z-10 flex flex-col items-center text-center pt-28 sm:pt-36 md:pt-44 px-4 sm:px-6 max-w-4xl mx-auto">
          {/* Tag Badge */}
          <div
            className="liquid-glass rounded-lg px-4 py-1.5 text-xs sm:text-sm text-white mb-5 sm:mb-6 animate-fade-up delay-1 flex items-center gap-2"
            style={{ background: 'rgba(255, 255, 255, 0.16)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Press 04 . Vernal woods</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white tracking-tight animate-fade-up delay-2 font-normal">
            records cut for the
            <br />
            calm listener.
          </h1>

          {/* Subtext */}
          <p className="mt-5 sm:mt-6 max-w-md text-sm sm:text-base md:text-lg leading-relaxed text-white/90 animate-fade-up delay-3 font-normal">
            Drone, roots, and nature-captured sound on wax LPs. Every disc cut just once, snag it or miss.
          </p>

          {/* Two Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto animate-fade-up delay-4">
            <a 
              href="#concerts"
              className="rounded-xl bg-white px-7 py-2.5 text-sm text-gray-900 font-medium hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto text-center cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <span>Browse the shelves</span>
              <ArrowDown className="w-4 h-4" />
            </a>
            <button 
              onClick={() => {
                setSelectedEvent(CONCERT_EVENTS[0]);
                setSelectedCat(CONCERT_EVENTS[0].categories[0]);
              }}
              className="liquid-glass rounded-xl px-7 py-2.5 text-sm text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto text-center cursor-pointer"
            >
              Newest arrivals
            </button>
          </div>
        </main>

        {/* Now Playing Widget */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-10 z-20 w-[270px] sm:w-72 animate-fade-up delay-5">
          {/* Track Card */}
          <div className="rounded-2xl bg-white p-2.5 pr-4 shadow-lg flex items-center gap-3">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="h-11 w-11 shrink-0 rounded-xl bg-blue-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
            >
              {isPlayingAudio ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
              )}
            </button>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-900 truncate">
                Helia Marsh -- Fern Light
              </p>
              <div className="mt-1.5 h-1 w-full rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full bg-blue-700 rounded-full transition-all duration-300 ${isPlayingAudio ? 'w-[65%]' : 'w-[30%]'}`} />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500 font-normal">
                <span>{isPlayingAudio ? '1:12' : '0:33'}</span>
                <span>-1:21</span>
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="mt-2 flex items-center gap-2">
            <button 
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 font-medium shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 text-center cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="h-10 w-10 shrink-0 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer"
              aria-label="Like track"
            >
              <Heart
                className={`w-4 h-4 text-blue-700 transition-colors ${
                  isLiked ? 'fill-blue-700' : ''
                }`}
              />
            </button>
            <button 
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 font-medium shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 text-center cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* -------------------- 2. LOWER LANDING PAGE SECTIONS -------------------- */}

      {/* SECTION A: CONCERT SHELVES & TICKET CATALOG */}
      <section id="concerts" className="relative z-10 py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="liquid-glass inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs text-blue-400 mb-3">
              <Ticket className="w-3.5 h-3.5" />
              <span>LIVE ORCHESTRA SHELVES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white">
              Upcoming Concert Drops
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-xl">
              Every performance disc and venue seat is cut just once. Reserve your allocation before quota locks close.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'SYMPHONY', 'CHAMBER MUSIC', 'BALLET & OPERA', 'PIANO RECITALS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-white text-gray-900 shadow-md font-semibold'
                    : 'liquid-glass text-gray-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Concert Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const minPrice = event.categories[0].price;
            const totalQuotaLeft = event.categories.reduce((acc, c) => acc + c.quota, 0);

            return (
              <div 
                key={event.id}
                className="liquid-glass rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-blue-500/50 transition-all group"
              >
                {/* Event Image Banner */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-blue-900/80 backdrop-blur-md text-blue-200 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-blue-400/30">
                      {event.category}
                    </span>
                  </div>

                  {totalQuotaLeft < 15 && (
                    <div className="absolute top-3 right-3 bg-red-950/80 backdrop-blur-md text-red-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-red-500/40 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-400 animate-pulse" />
                      <span>{totalQuotaLeft} seats left</span>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-normal text-white group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1 font-medium">{event.artist}</p>

                    <div className="mt-4 space-y-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{event.date} • {event.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Ticket Price</span>
                      <span className="text-sm font-semibold text-white">
                        {formatIDR(minPrice)}
                      </span>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setSelectedCat(event.categories[0]);
                      }}
                      className="bg-white text-gray-900 hover:bg-blue-600 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Book Seat</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION B: ARTISTS & PHILHARMONIC LINEUP */}
      <section id="lineup" className="relative z-10 py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="liquid-glass inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs text-blue-400 mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>SOLOISTS & ORCHESTRAS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white">
            World-Class Philharmonic Lineup
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Featuring world-renowned conductors, chamber soloists, and grand symphonies performing live in premier concert halls.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARTISTS_LINEUP.map((art, idx) => (
            <div key={idx} className="liquid-glass rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all text-center group">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                <img src={art.image} alt={art.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-base font-semibold text-white">{art.name}</h4>
              <p className="text-xs text-blue-400 mt-0.5">{art.genre}</p>
              <span className="inline-block mt-3 text-[10px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                {art.shows} Scheduled
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION C: TICKET WAR & METRICS TRACKER */}
      <section id="ticket-war" className="relative z-10 py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="liquid-glass rounded-3xl p-8 md:p-12 border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-gray-950 to-gray-950">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-900/60 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-700/40">
                <Lock className="w-3.5 h-3.5" />
                <span>ATOMIC ROW LOCKING ACTIVE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal text-white">
                Ticket War Quota Protection
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                SymphoniaTic utilizes Go-Fiber ACID transactions with explicit row locking (<code className="text-blue-400 font-mono">FOR UPDATE</code>) to guarantee zero double-booking during high-demand concert ticket drops.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Revenue</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 block">Rp 485.5M</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Tickets Sold</span>
                <span className="text-xl sm:text-2xl font-bold text-white mt-1 block">1,420 / 1,708</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Active Quota</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-400 mt-1 block">288 Seats</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Verification Rate</span>
                <span className="text-xl sm:text-2xl font-bold text-purple-400 mt-1 block">99.8%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: HOW IT WORKS / VERIFICATION GUIDE */}
      <section id="guide" className="relative z-10 py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-normal tracking-tight text-white">How SymphoniaTic Works</h2>
          <p className="text-sm text-gray-400 mt-2">3 simple steps to secure and enter your favorite classical concert.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="liquid-glass rounded-3xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-base mb-4">
              1
            </div>
            <h4 className="text-base font-semibold text-white">Select Seats & Quota</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Choose your concert event and preferred seating tier (VIP, CAT 1, Festival). Maximum 4 tickets per order transaction.
            </p>
          </div>

          <div className="liquid-glass rounded-3xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-base mb-4">
              2
            </div>
            <h4 className="text-base font-semibold text-white">Instant Verification</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Your order is locked and verified with real-time atomic transaction handling to avoid double allocation.
            </p>
          </div>

          <div className="liquid-glass rounded-3xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-base mb-4">
              3
            </div>
            <h4 className="text-base font-semibold text-white">Scan QR-SYM Code</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Receive your unique QR-SYM Code pass on your mobile device. Present at venue gates for instant scanner validation.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 md:px-12 border-t border-white/10 bg-gray-950 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 256 256" className="w-5 h-5 fill-white">
              <path d="M 256 256 L 128 256 C 198.692 256 256 198.692 256 128 C 256 57.308 198.692 0 128 0 C 57.308 0 0 57.308 0 128 C 0 198.692 57.308 256 128 256 L 0 256 L 0 0 L 256 0 Z M 128 104 C 141.255 104 152 114.745 152 128 C 152 141.255 141.255 152 128 152 C 114.745 152 104 141.255 104 128 C 104 114.745 114.745 104 128 104 Z" />
            </svg>
            <span className="text-sm font-semibold text-white">SymphoniaTic</span>
          </div>

          <div className="flex items-center gap-6 text-gray-400">
            <a href="#concerts" className="hover:text-white transition-colors">Concerts</a>
            <a href="#lineup" className="hover:text-white transition-colors">Lineup</a>
            <a href="#ticket-war" className="hover:text-white transition-colors">Quota Metrics</a>
            <a href="#guide" className="hover:text-white transition-colors">Scanner Guide</a>
          </div>

          <p>© 2026 SymphoniaTic Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* -------------------- DRAWERS & MODALS -------------------- */}

      {/* Booking Checkout Modal */}
      {selectedEvent && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-gray-900 text-white rounded-3xl p-6 border border-white/10 shadow-2xl relative">
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
              <h3 className="text-lg font-medium">Reserve Concert Tickets</h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">{selectedEvent.title}</p>

            <form onSubmit={handleBookingSubmit} className="mt-5 flex flex-col gap-4">
              {/* Category Select */}
              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1.5">Ticket Category</label>
                <div className="grid grid-cols-1 gap-2">
                  {selectedEvent.categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCat(cat)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selectedCat.id === cat.id
                          ? 'border-blue-500 bg-blue-950/40 text-white'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{cat.name}</div>
                        <div className="text-[10px] text-blue-400 mt-0.5">{cat.quota} seats remaining</div>
                      </div>
                      <div className="font-semibold text-white">{formatIDR(cat.price)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Picker (Max 4 per PRD rule) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-gray-300 font-medium">Quantity (Max 4)</label>
                  <span className="text-[10px] text-gray-400">Rule: Max 4 tickets/tx</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setQuantity(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        quantity === num
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Name & Email */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 font-medium block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-300 font-medium block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="eleanor@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Order Total & Submit */}
              <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block">Total Payment</span>
                  <span className="text-base font-bold text-white">
                    {formatIDR(selectedCat.price * quantity)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Confirmation / E-Ticket Modal */}
      {activeSuccessOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-gray-900 text-white rounded-3xl p-6 border border-blue-500/40 shadow-2xl text-center relative animate-fade-up">
            <button 
              onClick={() => setActiveSuccessOrder(null)}
              className="absolute top-4 right-4 liquid-glass p-2 rounded-xl text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-semibold text-white mt-3">Ticket Confirmed!</h3>
            <p className="text-xs text-gray-400 mt-0.5">Order Code: <span className="font-mono text-blue-400 font-semibold">{activeSuccessOrder.orderCode}</span></p>

            {/* QR Code Container */}
            <div className="my-5 p-4 bg-white rounded-2xl max-w-[200px] mx-auto shadow-inner flex flex-col items-center">
              <QrCode className="w-32 h-32 text-gray-900" />
              <span className="text-[10px] font-mono text-gray-600 mt-2 font-semibold tracking-wider">
                {activeSuccessOrder.qrCode}
              </span>
            </div>

            <div className="text-left bg-white/5 rounded-2xl p-3 border border-white/10 space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Event:</span>
                <span className="text-white font-medium truncate max-w-[170px]">{activeSuccessOrder.eventTitle}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Category:</span>
                <span className="text-white font-medium">{activeSuccessOrder.categoryName} ({activeSuccessOrder.quantity}x)</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Paid:</span>
                <span className="text-emerald-400 font-semibold">{formatIDR(activeSuccessOrder.totalPrice)}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveSuccessOrder(null)}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Done & Save E-Ticket
            </button>
          </div>
        </div>
      )}

      {/* Active Orders / E-Tickets Drawer */}
      {activeDrawer === 'ORDERS' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-gray-950/90 text-white h-full flex flex-col p-6 overflow-y-auto border-l border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-medium tracking-tight">My SymphoniaTic Pass</h2>
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
                <p className="text-sm font-medium text-white">No Active Concert Pass</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  You haven't reserved any tickets yet. Browse the shelves to snag your seats!
                </p>
                <a
                  href="#concerts"
                  onClick={() => setActiveDrawer(null)}
                  className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all inline-block"
                >
                  Browse Concerts
                </a>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {orders.map((ord, idx) => (
                  <div key={idx} className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-blue-400 font-semibold">{ord.orderCode}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {ord.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white">{ord.eventTitle}</h4>
                    <p className="text-xs text-gray-400">{ord.artist}</p>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Seats</span>
                        <span className="text-white font-medium">{ord.categoryName} ({ord.quantity}x)</span>
                      </div>
                      <button
                        onClick={() => setActiveSuccessOrder(ord)}
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Pass</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Metrics Drawer */}
      {activeDrawer === 'ADMIN' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-gray-950/90 text-white h-full flex flex-col p-6 overflow-y-auto border-l border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-medium tracking-tight">Admin Metrics Dashboard</h2>
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
                <span className="text-gray-400">Endpoint:</span>
                <p className="font-mono text-blue-400">GET /api/v1/admin/dashboard</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block">Total Revenue</span>
                  <span className="text-base font-bold text-emerald-400">Rp 485.500.000</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block">Tickets Sold</span>
                  <span className="text-base font-bold text-white">1,420</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block">Remaining Quota</span>
                  <span className="text-base font-bold text-blue-400">288</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block">Pending Verification</span>
                  <span className="text-base font-bold text-amber-400">12</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="font-semibold text-white">Atomic Transaction Protection</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Every order verification executes <code className="text-blue-400 font-mono">db.Begin()</code> with <code className="text-blue-400 font-mono">FOR UPDATE</code> row locking to prevent quota overselling during ticket wars.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
