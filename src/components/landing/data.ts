// ─── Types ───
export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  quota: number;
  benefits: string[];
}

export interface RundownItem {
  time: string;
  activity: string;
}

export interface EventItem {
  id: string | number;
  title: string;
  subtitle: string;
  artist: string;
  conductor: string;
  venue: string;
  address: string;
  googleMapsUrl?: string;
  date: string;
  time: string;
  openGate: string;
  category: string;
  categoryBadgeColor: string;
  image: string;
  audioUrl: string;
  organizer: string;
  description: string;
  rundown: RundownItem[];
  categories: TicketCategory[];
}

export interface OrderRecord {
  id: string;
  orderCode: string;
  eventId: string;
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
  status: string;
  paymentMethod: string;
  createdAt: string;
}

// ─── Utils ───
export const formatIDR = (amount: any): string => {
  let num = 0;
  if (typeof amount === 'number') {
    num = isNaN(amount) ? 0 : amount;
  } else if (typeof amount === 'string') {
    num = parseFloat(amount) || 0;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs === 0) return '0:00';
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
};

// ─── Data ───
export const CONCERT_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Symphony No. 5 in C minor",
    subtitle: "Opus 67 — I. Allegro con brio Masterpiece",
    artist: "Royal Philharmonic Orchestra & Jakarta Choral Society",
    conductor: "Maestro Alexander Vance",
    venue: "Aula Simfonia Jakarta",
    address: "Jl. Industri Blok B14 No.1, Kemayoran, Jakarta Pusat 10720",
    date: "Sabtu, 18 April 2026",
    time: "19:30 WIB",
    openGate: "18:00 WIB",
    category: "SIMFONI",
    categoryBadgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "/audio/Ludwig van Beethoven - Symphony n.5 in C minor, Op.67, I.Allegro con brio.mp3",
    organizer: "Royal Philharmonic Foundation & SymphoniaTic Events",
    description: "Mahakarya simfoni Ludwig van Beethoven yang sangat terkenal. Menampilkan irama 4 ketukan ikonik Allegro con brio dengan kolaborasi 90 musisi orkestra simfoni profesional.",
    rundown: [
      { time: "18:00 WIB", activity: "Pemeriksaan E-Ticket & Registrasi Open Gate" },
      { time: "19:00 WIB", activity: "Pintu Main Hall Dibuka & Pre-Concert Presentation" },
      { time: "19:30 WIB", activity: "Babak I: Movement I (Allegro con brio)" },
      { time: "20:30 WIB", activity: "Istirahat / Intermission (20 Menit)" },
      { time: "20:50 WIB", activity: "Babak II: Movement II & III Finale" },
      { time: "21:45 WIB", activity: "Selesai & Sesi Foto Konduktor" },
    ],
    categories: [
      { id: "c1-vip", name: "VIP Orchestral Pit", price: 750000, quota: 14, benefits: ["Baris Depan Tengah", "Welcome Drink & Cocktail Lounge", "Buku Program Eksklusif", "Meet & Greet Konduktor"] },
      { id: "c1-cat1", name: "CAT 1 Grand Tier", price: 450000, quota: 24, benefits: ["Balkon Tengah Akustik Jernih", "Tempat Duduk Bernomor", "Digital Event Guide"] },
      { id: "c1-fest", name: "Festival Stalls", price: 300000, quota: 50, benefits: ["Lantai Utama View Langsung", "Tempat Duduk Teratur"] },
    ],
  },
  {
    id: 2,
    title: "Viva La Vida (Orchestra Festa)",
    subtitle: "Coldplay & Oasis Band Music Orchestra Celebration",
    artist: "Vivaldi & Band Orchestra Ensemble",
    conductor: "Violinis Utama Iskandar Widjaja",
    venue: "TIM Concert Hall (Taman Ismail Marzuki)",
    address: "Jl. Cikini Raya No.73, Menteng, Jakarta Pusat",
    date: "Minggu, 19 April 2026",
    time: "20:00 WIB",
    openGate: "18:30 WIB",
    category: "KAMAR MUSIK",
    categoryBadgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "/audio/coldplay - Viva La Vida I COLDPLAY & OASIS AND BAND MUSIC ORCHESTRA FESTA.mp3",
    organizer: "Jakarta Chamber Society & Modern Orchestra",
    description: "Reinterpretasi megah lagu hit Viva La Vida yang dibawakan oleh gabungan tim orkestra simfoni dan ansambel string modern.",
    rundown: [
      { time: "18:30 WIB", activity: "Open Gate & Registrasi Ulang E-Ticket" },
      { time: "19:30 WIB", activity: "Pengenalan Karya & Pengantar Neoklasik" },
      { time: "20:00 WIB", activity: "Pertunjukan Utama Viva La Vida Orchestra" },
      { time: "21:00 WIB", activity: "Pertunjukan Sesi II Band Symphony" },
      { time: "22:00 WIB", activity: "Penutupan & Sesi Tanya Jawab Musik" },
    ],
    categories: [
      { id: "c2-vip", name: "VIP Front Row", price: 850000, quota: 5, benefits: ["Baris Utama Depan Panggung", "Merchandise Kaos Eksklusif", "Akses VIP Lounge"] },
      { id: "c2-cat1", name: "CAT 1 Main Hall", price: 500000, quota: 120, benefits: ["Area Utama Hall", "Pandangan Jelas Ke Musisi"] },
    ],
  },
  {
    id: 3,
    title: "The Winner Takes It All (Epic Orchestra)",
    subtitle: "Pertunjukan Balet & Orkestra Epik Mahakarya ABBA",
    artist: "Grand Opera Orchestra & Jakarta Ballet Company",
    conductor: "Maestro David Chen",
    venue: "JIExpo Symphony Hall",
    address: "Gedung Pusat Niaga Pekan Raya Jakarta, Kemayoran, Jakarta Pusat",
    date: "Jumat, 24 April 2026",
    time: "19:00 WIB",
    openGate: "17:30 WIB",
    category: "BALET & OPERA",
    categoryBadgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "/audio/ABBA - The Winner Takes It All  Epic Orchestra (2020).mp3",
    organizer: "Indonesian Classical Ballet Theatre",
    description: "Aransemen epik orkestra dari lagu legendaris ABBA 'The Winner Takes It All' diiringi koreografi tarian balet simfoni kolosal.",
    rundown: [
      { time: "17:30 WIB", activity: "Open Gate & Booth Merchandise Balet" },
      { time: "19:00 WIB", activity: "Babak I: Epic Orchestra Suite Act 1" },
      { time: "20:15 WIB", activity: "Istirahat (15 Menit)" },
      { time: "20:30 WIB", activity: "Babak II: Winner Takes It All Highlights" },
      { time: "21:30 WIB", activity: "Penutupan & Curtain Call" },
    ],
    categories: [
      { id: "c3-vip", name: "Royal Box VIP", price: 600000, quota: 8, benefits: ["Balkon Khusus Royal Box", "Foto Bersama Prima Ballerina", "Snack Box Premium"] },
      { id: "c3-cat1", name: "CAT 1 Balcony", price: 350000, quota: 12, benefits: ["Perspektif Panorama Atas", "Kursi Empuk Busa"] },
    ],
  },
  {
    id: 4,
    title: "Laskar Pelangi (TRUST Symphony)",
    subtitle: "Konser Simfoni Mahakarya Kebangsaan Indonesia",
    artist: "TRUST (Trinity Youth Symphony Orchestra)",
    conductor: "Dr. Nathania Karina",
    venue: "Aula Simfonia Jakarta",
    address: "Jl. Industri Blok B14 No.1, Kemayoran, Jakarta Pusat",
    date: "Sabtu, 2 Mei 2026",
    time: "19:00 WIB",
    openGate: "17:30 WIB",
    category: "NUSANTARA SYMPHONY",
    categoryBadgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "/audio/Laskar Pelangi  TRUST (Trinity Youth Symphony Orchestra).mp3",
    organizer: "TRUST Orchestra & SymphoniaTic Events",
    description: "Aransemen orkestra simfoni memukau dari lagu kebangsaan legendaris Laskar Pelangi karya Nidji, dibawakan secara megah oleh Trinity Youth Symphony Orchestra.",
    rundown: [
      { time: "17:30 WIB", activity: "Open Gate & Booth Merchandise Nusantara" },
      { time: "19:00 WIB", activity: "Babak I: Simfoni Pemuda & Lagu Nusantara" },
      { time: "20:15 WIB", activity: "Istirahat (15 Menit)" },
      { time: "20:30 WIB", activity: "Babak II: Pertunjukan Utama Laskar Pelangi Symphony" },
      { time: "21:45 WIB", activity: "Selesai & Sesi Foto Musisi" },
    ],
    categories: [
      { id: "c4-vip", name: "VIP Nusantara Pit", price: 650000, quota: 10, benefits: ["Baris VIP Depan Panggung", "Buku Program & Tanda Tangan Konduktor"] },
      { id: "c4-cat1", name: "CAT 1 Main Tier", price: 400000, quota: 30, benefits: ["Balkon Akustik Jernih", "Tempat Duduk Bernomor"] },
    ],
  },
];

export const ARTISTS_LINEUP = [
  { name: "Royal Philharmonic Orchestra", genre: "Orkestra Simfoni Utama", image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80", shows: "12 Konser Musim Ini" },
  { name: "Vienna Choir Soloists", genre: "Paduan Suara Koral & Opera", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80", shows: "8 Pertunjukan Mandiri" },
  { name: "Max Richter & Chamber Group", genre: "Neoklasik & Musik Ambient", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80", shows: "6 Tur Spesial" },
  { name: "London Symphony Orchestra", genre: "Simfoni Internasional", image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=500&q=80", shows: "15 Jadwal Dunia" },
];

export const FAQS = [
  { q: "Bagaimana cara mendapatkan E-Ticket setelah melakukan pemesanan?", a: "Setelah Anda mengonfirmasi pesanan tiket di web SymphoniaTic, sistem secara otomatis menerbitkan kode pesanan unik (contoh: SYM-893472) dan E-Ticket resmi yang dilengkapi Kode QR (QR-SYM-XXXXX). Anda dapat melihat dan menyimpan E-Ticket kapan saja di menu 'E-Ticket Saya'." },
  { q: "Berapa jumlah maksimal tiket yang dapat dibeli dalam 1 transaksi?", a: "Sesuai dengan aturan kuota resmi SymphoniaTic untuk mencegah percaloan, setiap transaksi dibatasi maksimal 4 tiket per akun/identitas pemesan." },
  { q: "Apakah E-Ticket perlu dicetak saat datang ke lokasi acara?", a: "Tidak perlu. Anda cukup menunjukkan gambar Kode QR E-Ticket langsung dari layar smartphone Anda di pintu masuk (Open Gate) untuk dipindai oleh pemindai petugas gate." },
  { q: "Bagaimana aturan pakaian (dress code) untuk konser simfoni?", a: "Pengunjung dianjurkan menggunakan pakaian Rapi & Sopan (Smart Casual, Batik, Formal, atau Gaun Malam). Tidak diperkenankan menggunakan celana pendek atau sandal jepit." },
];

export const NAV_PAGES = [
  { label: 'Jelajah Konser', href: '#concerts' },
  { label: 'Artis & Lineup', href: '#lineup' },
  { label: 'Sistem Kuota', href: '#ticket-war' },
  { label: 'Panduan E-Ticket', href: '#guide' },
  { label: 'FAQ', href: '#faq' },
];

// ─── Admin API Types & Helpers ───
export interface AdminMetricsData {
  totalRevenue: number;
  ticketsSold: number;
  remainingQuota: number;
  totalEvents: number;
  totalOrders: number;
  eventStats?: { eventId: string; title: string; revenue: number; ticketsSold: number }[];
  recentOrders?: { id: string; orderCode: string; eventTitle: string; quantity: number; totalPrice: number; userName: string; status: string; createdAt: string }[];
}

export interface CreateEventInput {
  title: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  category?: string;
  categoryBadgeColor?: string;
  image: string;
  audioUrl?: string;
  conductor?: string;
  openGate?: string;
  address?: string;
  organizer?: string;
  subtitle?: string;
  description: string;
  rundown?: RundownItem[];
  categories: { name: string; price: number; quota: number }[];
}

export const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_API_BASE_URL) {
    return import.meta.env.PUBLIC_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window as any).PUBLIC_API_BASE_URL) {
    return (window as any).PUBLIC_API_BASE_URL;
  }
  return 'http://localhost:8082/api/v1';
};

export const fetchEventsAPI = async (): Promise<EventItem[]> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/events`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((evt: any) => ({
        id: evt.id,
        title: evt.title,
        subtitle: evt.subtitle || evt.artist || 'Pertunjukan Mahakarya Simfoni',
        artist: evt.artist,
        conductor: evt.conductor || '-',
        venue: evt.venue,
        address: evt.address || evt.venue,
        googleMapsUrl: evt.googleMapsUrl || '',
        date: evt.date,
        time: evt.time,
        openGate: evt.openGate || '18:00 WIB',
        category: evt.category || 'SIMFONI UTAMA',
        categoryBadgeColor: evt.categoryBadgeColor || 'bg-blue-900/80 text-blue-200 border-blue-500/40',
        image: evt.image || 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1000&auto=format&fit=crop',
        audioUrl: evt.audioUrl || '',
        organizer: evt.organizer || 'SymphoniaTic Production',
        description: evt.description,
        rundown: Array.isArray(evt.rundown) && evt.rundown.length > 0
          ? evt.rundown
          : [
              { time: '18:00 WIB', activity: 'Open Gate & Registrasi Tiket' },
              { time: '19:30 WIB', activity: 'Pertunjukan Utama' },
              { time: '21:30 WIB', activity: 'Selesai & Curtain Call' },
            ],
        categories: (evt.categories || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          price: typeof cat.price === 'string' ? parseFloat(cat.price) : cat.price,
          quota: cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota,
          benefits: ['Akustik Jernih', 'Tempat Duduk Bernomor', 'Pass Digital']
        }))
      }));
    }
    return [];
  } catch (err) {
    console.error('Fetch events API error:', err);
    return [];
  }
};

export const createOrderAPI = async (payload: {
  eventId: string;
  ticketCategoryId: string;
  quantity: number;
  userName: string;
  userEmail: string;
}) => {
  const res = await fetch(`${getApiBaseUrl()}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const lookupTicketAPI = async (code: string) => {
  const res = await fetch(`${getApiBaseUrl()}/tickets/lookup?code=${encodeURIComponent(code)}`);
  return res.json();
};

export const adminLoginAPI = async (username: string, password: string) => {
  const res = await fetch(`${getApiBaseUrl()}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const fetchAdminMetricsAPI = async (): Promise<AdminMetricsData | null> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/admin/dashboard`);
    const data = await res.json();
    if (data.success && data.data) {
      const d = data.data;
      return {
        totalRevenue: typeof d.totalRevenue === 'string' ? parseFloat(d.totalRevenue) : (d.totalRevenue || 0),
        ticketsSold: Number(d.ticketsSold || 0),
        remainingQuota: Number(d.remainingQuota || 0),
        totalEvents: Number(d.totalEvents || 0),
        totalOrders: Number(d.totalOrders || 0),
        eventStats: Array.isArray(d.eventStats) ? d.eventStats.map((st: any) => ({
          eventId: String(st.eventId || ''),
          title: String(st.title || 'Konser'),
          revenue: typeof st.revenue === 'string' ? parseFloat(st.revenue) : (st.revenue || 0),
          ticketsSold: Number(st.ticketsSold || 0),
        })) : [],
        recentOrders: Array.isArray(d.recentOrders) ? d.recentOrders.map((ro: any) => ({
          id: String(ro.id || ''),
          orderCode: String(ro.orderCode || ''),
          eventTitle: String(ro.eventTitle || 'Konser'),
          quantity: Number(ro.quantity || 1),
          totalPrice: typeof ro.totalPrice === 'string' ? parseFloat(ro.totalPrice) : (ro.totalPrice || 0),
          userName: String(ro.userName || 'Guest'),
          status: String(ro.status || 'VERIFIED'),
          createdAt: String(ro.createdAt || ''),
        })) : [],
      };
    }
    return null;
  } catch (err) {
    console.error('Fetch admin metrics error:', err);
    return null;
  }
};

export const createEventAPI = async (payload: CreateEventInput) => {
  const res = await fetch(`${getApiBaseUrl()}/admin/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateEventAPI = async (eventId: string, payload: Partial<CreateEventInput>) => {
  const res = await fetch(`${getApiBaseUrl()}/admin/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteEventAPI = async (eventId: string) => {
  const res = await fetch(`${getApiBaseUrl()}/admin/events/${eventId}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const createTicketCategoryAPI = async (eventId: string, payload: { name: string; price: number; quota: number }) => {
  const res = await fetch(`${getApiBaseUrl()}/admin/events/${eventId}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateTicketCategoryAPI = async (catId: string, payload: { name: string; price: number; quota: number }) => {
  const res = await fetch(`${getApiBaseUrl()}/admin/categories/${catId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteTicketCategoryAPI = async (catId: string) => {
  const res = await fetch(`${getApiBaseUrl()}/admin/categories/${catId}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const fetchAdminOrdersAPI = async (search = '', status = '') => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const res = await fetch(`${getApiBaseUrl()}/admin/orders?${params.toString()}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((o: any) => ({
        id: String(o.id || ''),
        orderCode: String(o.orderCode || ''),
        eventId: String(o.eventId || ''),
        eventTitle: String(o.eventTitle || ''),
        artist: String(o.artist || ''),
        venue: String(o.venue || ''),
        date: String(o.date || ''),
        categoryName: String(o.categoryName || ''),
        quantity: Number(o.quantity || 1),
        totalPrice: typeof o.totalPrice === 'string' ? parseFloat(o.totalPrice) : (o.totalPrice || 0),
        userName: String(o.userName || ''),
        userEmail: String(o.userEmail || ''),
        qrCode: String(o.qrCode || ''),
        status: String(o.status || 'VERIFIED'),
        paymentMethod: String(o.paymentMethod || 'SANDBOX_PAYMENT'),
        createdAt: String(o.createdAt || ''),
      }));
    }
    return [];
  } catch (err) {
    console.error('Fetch admin orders error:', err);
    return [];
  }
};

export const updateOrderStatusAPI = async (orderId: string, status: string) => {
  const res = await fetch(`${getApiBaseUrl()}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

