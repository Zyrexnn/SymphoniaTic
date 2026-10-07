import type { LucideIcon } from 'lucide-react';
import { VolumeX, CameraOff, Hand, Shirt } from 'lucide-react';

export type EdukasiSectionId = 'etika' | 'pakaian' | 'komponis' | 'glosarium';

export interface EdukasiNavItem {
  id: EdukasiSectionId;
  number: string;
  label: string;
}

export const EDUKASI_NAV: EdukasiNavItem[] = [
  { id: 'etika', number: '01', label: 'Etika' },
  { id: 'pakaian', number: '02', label: 'Panduan Pakaian' },
  { id: 'komponis', number: '03', label: 'Komponis' },
  { id: 'glosarium', number: '04', label: 'Glosarium' },
];

export interface VenueRule {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const VENUE_RULES: VenueRule[] = [
  { icon: VolumeX, title: 'Mode Senyap HP', desc: 'Ponsel wajib mode senyap atau dimatikan selama pertunjukan berlangsung.' },
  { icon: CameraOff, title: 'Tanpa Flash Kamera', desc: 'Flash dan lampu video dilarang karena mengganggu konsentrasi musisi dan penonton lain.' },
  { icon: Hand, title: 'Tepuk Tangan', desc: 'Bertepuk tangan hanya setelah seluruh movement selesai. Tanda penonton berpengalaman adalah hening di sela movement.' },
  { icon: Shirt, title: 'Latecomer Entrance', desc: 'Penonton terlambat hanya boleh masuk saat jeda antar movement atau intermission.' },
];

export interface DressCode {
  label: string;
  name: string;
  description: string;
  image: string;
}

export const DRESS_CODES: DressCode[] = [
  {
    label: 'Formal',
    name: 'Black Tie',
    description: 'Jas gelap lengkap dengan dasi, gaun malam, atau kebaya formal. Direkomendasikan untuk kursi VIP dan premiere.',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Most Common',
    name: 'Smart Casual',
    description: 'Kemeja rapi, celana bahan, blazer, atau batik modern. Pilihan paling umum dan diterima di semua kategori kursi.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Accepted',
    name: 'Casual Rapi',
    description: 'Kaos polos, denim gelap, sneaker bersih. Diterima untuk konser neoklasik, namun hindari sandal dan celana pendek.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
  },
];

export interface Composer {
  name: string;
  era: string;
  lifespan: string;
  country: string;
  context: string;
  works: string[];
  image: string;
}

export const COMPOSERS: Composer[] = [
  {
    name: 'Ludwig van Beethoven',
    era: 'Transisi Klasik ke Romantis',
    lifespan: '1770 - 1827',
    country: 'Jerman',
    context: 'Bapak simfoni modern. Mulai kehilangan pendengaran sekitar 1798, kondisi yang justru memperdalam ekspresi karyanya. Symphony No. 5 ditulis 1804 sampai 1808 di tengah pergolakan Perang Napoleon. Motif empat nada pembuka menjadi salah satu ikon musik paling dikenal dunia.',
    works: ['Symphony No. 5 in C minor, Op. 67', 'Symphony No. 9 "Ode to Joy"', 'Piano Sonata No. 14 "Moonlight"', 'Für Elise'],
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1100&q=80',
  },
  {
    name: 'Wolfgang Amadeus Mozart',
    era: 'Klasik Viennese',
    lifespan: '1756 - 1791',
    country: 'Austria',
    context: 'Prodigy yang mulai komposisi usia 5 tahun. Menggabungkan keindahan melodi dengan struktur formal yang sempurna. Wafat di usia 35 tahun, meninggalkan lebih dari 600 karya. Requiem terakhirnya sempat tak terselesaikan.',
    works: ['Symphony No. 40 in G minor', 'Piano Concerto No. 21', 'Eine kleine Nachtmusik', 'Requiem in D minor'],
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1100&q=80',
  },
  {
    name: 'Frédéric Chopin',
    era: 'Romantis',
    lifespan: '1810 - 1849',
    country: 'Polandia',
    context: 'Penyair piano. Hampir seluruh karyanya ditulis untuk piano solo. Tinggal di Paris sebagian besar hidupnya. Nocturne-nya menggabungkan lirisitas vokal dengan harmoni inovatif. Meninggal muda di usia 39 tahun.',
    works: ['Nocturne Op. 9 No. 2', 'Ballade No. 1 in G minor', 'Fantaisie-Impromptu', 'Revolutionary Étude'],
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1100&q=80',
  },
  {
    name: 'Antonio Vivaldi',
    era: 'Barok',
    lifespan: '1678 - 1741',
    country: 'Italia',
    context: 'Padre merah dari Venesia. Menulis lebih dari 500 konser, termasuk The Four Seasons yang kembali programatik paling terkenal. Menjadi pastor namun berhenti melayani misa karena alasan kesehatan, lalu mengabdikan diri pada musik.',
    works: ['The Four Seasons', 'Gloria in D', 'Lute Concerto in D', 'Violin Concerto in A minor'],
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1100&q=80',
  },
];

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { term: 'Adagio', definition: 'Tempo lambat dan tenang.' },
  { term: 'Allegro', definition: 'Tempo cepat dan hidup. Allegro con brio berarti cepat dengan semangat.' },
  { term: 'Andante', definition: 'Penunjuk tempo yang berarti berjalan, tidak terlalu lambat maupun cepat.' },
  { term: 'Arpeggio', definition: 'Nada-nada sebuah chord dimainkan secara berurutan.' },
  { term: 'Baroque', definition: 'Era musik sekitar 1600 sampai 1750 yang ditandai ornamentasi kaya dan pola harmoni yang tetap.' },
  { term: 'Cadenza', definition: 'Passage solo virtuosik, biasanya mendekati akhir movement, di mana solois menampilkan improvisasi teknis tanpa iringan penuh.' },
  { term: 'Chamber Music', definition: 'Musik klasik untuk kelompok kecil musisi, umumnya 2 sampai 9 orang, dimainkan tanpa konduktor.' },
  { term: 'Conductor', definition: 'Dirigen, pemimpin orkestra yang mengatur tempo, dinamika, dan penyatuan para musisi.' },
  { term: 'Encore', definition: 'Lagu tambahan yang dimainkan setelah program utama selesai sebagai respons tepuk tangan penonton.' },
  { term: 'Forte', definition: 'Penunjuk dinamika yang berarti keras atau kuat. Disimbolkan f.' },
  { term: 'Movement', definition: 'Bagian mandiri dari sebuah karya besar seperti simfoni. Penonton tradisional menunggu seluruh movement selesai sebelum bertepuk tangan.' },
  { term: 'Opus', definition: 'Nomor katalog yang menunjukkan urutan penerbitan karya seorang komponis, disingkat Op.' },
  { term: 'Orchestra Pit', definition: 'Area tempat duduk musisi di depan panggung, sedikit lebih rendah dari lantai penonton.' },
  { term: 'Overture', definition: 'Pembuka instrumental yang dimainkan sebelum opera atau balet dimulai.' },
  { term: 'Piano', definition: 'Penunjuk dinamika yang berarti lembut. Disimbolkan p. Bukan merujuk alat musik piano.' },
  { term: 'Symphony', definition: 'Karya orkestra besar multi-bagian, biasanya empat movement, untuk orkestra simfoni penuh.' },
  { term: 'Vibrato', definition: 'Teknik getaran pitch yang dilakukan penyanyi atau pemain gesek untuk memperkaya warna bunyi.' },
];

export interface GuideStep {
  title: string;
  description: string;
}

export const FIRST_TIMER_STEPS: GuideStep[] = [
  { title: 'Datang 20 sampai 30 menit lebih awal', description: 'Beri waktu untuk menemukan bangku, mencetak e-ticket, dan melewati pemeriksaan gerbang tanpa terburu-buru.' },
  { title: 'Matikan atau silent ponsel', description: 'Selesaikan semua notifikasi sebelum pertunjukan dimulai. Nada bip dan getaran terasa sangat mengganggu di ruang konser.' },
  { title: 'Perhatikan cue untuk tepuk tangan', description: 'Jika masih berlangsung setelah movement terakhir selesai, tunggu aba-aba konduktor sebelum bertepuk tangan.' },
  { title: 'Kenakan pakaian yang sesuai', description: 'Pilih dress code sesuai kategori kursi dan occasion. Rapi dan sopan sudah cukup, tidak perlu formal penuh.' },
  { title: 'Nikmati tanpa mengganggu penonton lain', description: 'Matikan dering, jangan bicara, dan biarkan orkestra yang menjadi sorotan malam ini.' },
];
