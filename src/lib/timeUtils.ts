export interface ParsedTime {
  hours: number;
  minutes: number;
  totalMinutes: number;
  raw24: string;
  timezone: string;
}

export interface ParsedDate {
  iso: string;
  formattedID: string;
  day: string;
  shortMonthID: string;
  monthIndex: number;
  year: string;
  weekdayID: string;
}

export interface DynamicRundownItem {
  time: string;
  activity: string;
}

const KNOWN_TIMEZONES = ['WIB', 'WITA', 'WIT', 'UTC', 'GMT'];

const ID_WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const ID_MONTHS_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const ID_MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

const MONTH_ALIASES: Record<string, number> = {
  januari: 0, jan: 0, january: 0,
  februari: 1, feb: 1, february: 1, peb: 1, pebruari: 1,
  maret: 2, mar: 2, march: 2,
  april: 3, apr: 3,
  mei: 4, may: 4,
  juni: 5, jun: 5, june: 5,
  juli: 6, jul: 6, july: 6,
  agustus: 7, agu: 7, agt: 7, aug: 7, august: 7,
  september: 8, sep: 8, sept: 8,
  oktober: 9, okt: 9, oct: 9, october: 9,
  november: 10, nov: 10, nop: 10, nopember: 10,
  desember: 11, des: 11, dec: 11, december: 11,
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function extractTimezone(input: string, fallback = 'WIB'): string {
  if (!input) return fallback;
  const upper = input.toUpperCase();
  for (const tz of KNOWN_TIMEZONES) {
    const regex = new RegExp(`\\b${tz}\\b`);
    if (regex.test(upper)) return tz;
  }
  return fallback;
}

export function parseTimeString(str?: string | null): ParsedTime | null {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  const timezone = extractTimezone(trimmed, 'WIB');
  const match = trimmed.match(/(\d{1,2})\s*[:.]\s*(\d{1,2})(?:\s*[:.]\s*\d{1,2})?\s*(AM|PM)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === 'AM') {
      if (hours === 12) hours = 0;
    } else if (meridiem === 'PM') {
      if (hours !== 12) hours += 12;
    }
  } else if (hours < 0 || hours > 23) {
    return null;
  }

  const raw24 = `${pad2(hours)}:${pad2(minutes)}`;
  return {
    hours,
    minutes,
    totalMinutes: hours * 60 + minutes,
    raw24,
    timezone,
  };
}

export function formatTimeString(hours: number, minutes: number, timezone = 'WIB'): string {
  const safeHours = ((Math.floor(hours) % 24) + 24) % 24;
  const safeMinutes = ((Math.floor(minutes) % 60) + 60) % 60;
  const base = `${pad2(safeHours)}:${pad2(safeMinutes)}`;
  return timezone ? `${base} ${timezone}` : base;
}

export function normalizeTimeString(str?: string | null, fallbackTimezone = 'WIB'): string {
  const parsed = parseTimeString(str);
  if (!parsed) return str ? str.trim() : '';
  const tz = extractTimezone(str || '', fallbackTimezone);
  return formatTimeString(parsed.hours, parsed.minutes, tz);
}

export function shiftTimeMinutes(
  timeStr: string,
  deltaMinutes: number,
  options: { clampSameDay?: boolean } = {}
): string {
  const parsed = parseTimeString(timeStr);
  if (!parsed) return '';

  let nextTotal = parsed.totalMinutes + deltaMinutes;
  if (options.clampSameDay) {
    nextTotal = Math.max(0, Math.min(23 * 60 + 59, nextTotal));
  } else {
    nextTotal = ((nextTotal % 1440) + 1440) % 1440;
  }

  const nextHours = Math.floor(nextTotal / 60);
  const nextMinutes = nextTotal % 60;
  return formatTimeString(nextHours, nextMinutes, parsed.timezone);
}

export function calculateDefaultOpenGate(concertTimeStr: string, offsetMinutes = 90): string {
  const parsed = parseTimeString(concertTimeStr);
  if (!parsed) return '';
  if (parsed.totalMinutes === 0) return formatTimeString(0, 0, parsed.timezone);
  const shifted = Math.max(0, parsed.totalMinutes - Math.abs(offsetMinutes));
  return formatTimeString(Math.floor(shifted / 60), shifted % 60, parsed.timezone);
}

export function isTimeBefore(earlierStr?: string | null, laterStr?: string | null): boolean {
  const t1 = parseTimeString(earlierStr);
  const t2 = parseTimeString(laterStr);
  if (!t1 || !t2) return false;
  return t1.totalMinutes < t2.totalMinutes;
}

export function generateDynamicRundown(
  concertTimeStr: string,
  openGateStr?: string
): DynamicRundownItem[] {
  const parsedConcert = parseTimeString(concertTimeStr);
  if (!parsedConcert) return [];

  const tz = parsedConcert.timezone;
  const normalizedConcert = formatTimeString(parsedConcert.hours, parsedConcert.minutes, tz);

  const parsedGate = parseTimeString(openGateStr);
  const effectiveGate =
    parsedGate && parsedGate.totalMinutes < parsedConcert.totalMinutes
      ? formatTimeString(parsedGate.hours, parsedGate.minutes, parsedGate.timezone || tz)
      : calculateDefaultOpenGate(normalizedConcert, 90);

  const effectiveGateParsed = parseTimeString(effectiveGate)!;
  const items: DynamicRundownItem[] = [
    { time: effectiveGate, activity: 'Registrasi & Open Gate' },
  ];

  const gapMinutes = parsedConcert.totalMinutes - effectiveGateParsed.totalMinutes;
  if (gapMinutes >= 45) {
    items.push({
      time: shiftTimeMinutes(normalizedConcert, -30, { clampSameDay: true }),
      activity: 'Pintu Main Hall Dibuka',
    });
  }

  items.push({ time: normalizedConcert, activity: 'Pertunjukan Utama' });
  items.push({
    time: shiftTimeMinutes(normalizedConcert, 120, { clampSameDay: false }),
    activity: 'Selesai & Curtain Call',
  });

  return items;
}

function buildParsedDate(yearNum: number, monthIndex: number, dayNum: number): ParsedDate | null {
  if (monthIndex < 0 || monthIndex > 11 || dayNum < 1 || dayNum > 31 || yearNum < 1900 || yearNum > 2100) {
    return null;
  }
  const dt = new Date(yearNum, monthIndex, dayNum);
  if (dt.getFullYear() !== yearNum || dt.getMonth() !== monthIndex || dt.getDate() !== dayNum) {
    return null;
  }
  const weekdayID = ID_WEEKDAYS[dt.getDay()];
  const monthFullID = ID_MONTHS_FULL[monthIndex];
  const shortMonthID = ID_MONTHS_SHORT[monthIndex];
  return {
    iso: `${yearNum}-${pad2(monthIndex + 1)}-${pad2(dayNum)}`,
    formattedID: `${weekdayID}, ${dayNum} ${monthFullID} ${yearNum}`,
    day: String(dayNum),
    shortMonthID,
    monthIndex,
    year: String(yearNum),
    weekdayID,
  };
}

export function parseDateFlexible(dateStr?: string | null): ParsedDate | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // ISO format: YYYY-MM-DD (optionally followed by T...)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|T|\s)/);
  if (isoMatch) {
    return buildParsedDate(
      parseInt(isoMatch[1], 10),
      parseInt(isoMatch[2], 10) - 1,
      parseInt(isoMatch[3], 10)
    );
  }

  // Slash or dash DMY: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    return buildParsedDate(
      parseInt(dmyMatch[3], 10),
      parseInt(dmyMatch[2], 10) - 1,
      parseInt(dmyMatch[1], 10)
    );
  }

  // Strip optional leading weekday: "Minggu, 22 November 2026" or "Sunday, Nov 22, 2026"
  const withoutWeekday = trimmed.replace(/^[A-Za-z]+,\s*/, '');

  // Day Month Year: "22 November 2026" or "22 Nov 2026"
  const dMonthY = withoutWeekday.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})/);
  if (dMonthY) {
    const mIdx = MONTH_ALIASES[dMonthY[2].toLowerCase()];
    if (mIdx !== undefined) {
      return buildParsedDate(parseInt(dMonthY[3], 10), mIdx, parseInt(dMonthY[1], 10));
    }
  }

  // Month Day, Year: "Nov 22, 2026" or "November 22 2026"
  const monthDY = withoutWeekday.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (monthDY) {
    const mIdx = MONTH_ALIASES[monthDY[1].toLowerCase()];
    if (mIdx !== undefined) {
      return buildParsedDate(parseInt(monthDY[3], 10), mIdx, parseInt(monthDY[2], 10));
    }
  }

  return null;
}

const ZONE_OFFSETS_HOURS: Record<string, number> = {
  WIB: 7,
  WITA: 8,
  WIT: 9,
  UTC: 0,
  GMT: 0,
};

export function concertInstantMs(date: string, time: string): number | null {
  const parsedDate = parseDateFlexible(date);
  const parsedTime = parseTimeString(time);
  if (!parsedDate || !parsedTime) return null;

  const offsetHours = ZONE_OFFSETS_HOURS[parsedTime.timezone] ?? 7;
  return (
    Date.UTC(
      Number(parsedDate.year),
      parsedDate.monthIndex,
      Number(parsedDate.day),
      parsedTime.hours,
      parsedTime.minutes,
      0,
      0
    ) -
    offsetHours * 3600_000
  );
}

export function isSalesCutoffAfterConcert(
  salesEndAt: string,
  date: string,
  time: string
): boolean {
  if (!salesEndAt) return false;
  const cutoffMs = new Date(salesEndAt).getTime();
  if (Number.isNaN(cutoffMs)) return false;
  const concertMs = concertInstantMs(date, time);
  if (concertMs === null) return false;
  return cutoffMs > concertMs;
}
