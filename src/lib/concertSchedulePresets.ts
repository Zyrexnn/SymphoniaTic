import {
  calculateDefaultOpenGate,
  formatTimeString,
  isTimeBefore,
  parseTimeString,
  shiftTimeMinutes,
  type DynamicRundownItem,
} from './timeUtils.ts';

export interface SchedulePreset {
  id: string;
  label: string;
  time: string;
  openGateOffsetMinutes: number;
  defaultRundownTemplate: string;
}

export interface RundownTemplate {
  id: string;
  name: string;
  items: Array<{ offsetFromConcertMinutes: number; activity: string }>;
}

export const CONCERT_TIME_PRESETS: SchedulePreset[] = [
  {
    id: 'matinee',
    label: 'Matinee',
    time: '15:30 WIB',
    openGateOffsetMinutes: 60,
    defaultRundownTemplate: 'recital',
  },
  {
    id: 'evening',
    label: 'Malam',
    time: '19:30 WIB',
    openGateOffsetMinutes: 90,
    defaultRundownTemplate: 'symphony',
  },
  {
    id: 'gala',
    label: 'Gala',
    time: '20:00 WIB',
    openGateOffsetMinutes: 90,
    defaultRundownTemplate: 'gala',
  },
];

export const RUNDOWN_TEMPLATES: RundownTemplate[] = [
  {
    id: 'symphony',
    name: 'Simfoni 2 Babak + Intermission',
    items: [
      { offsetFromConcertMinutes: -30, activity: 'Pintu Main Hall Dibuka' },
      { offsetFromConcertMinutes: 0, activity: 'Babak I' },
      { offsetFromConcertMinutes: 60, activity: 'Intermission (20 Menit)' },
      { offsetFromConcertMinutes: 80, activity: 'Babak II' },
      { offsetFromConcertMinutes: 135, activity: 'Selesai & Curtain Call' },
    ],
  },
  {
    id: 'recital',
    name: 'Resital / Musik Kamar',
    items: [
      { offsetFromConcertMinutes: -15, activity: 'Pintu Aula Dibuka' },
      { offsetFromConcertMinutes: 0, activity: 'Resital Dimulai' },
      { offsetFromConcertMinutes: 75, activity: 'Selesai & Sesi Foto' },
    ],
  },
  {
    id: 'gala',
    name: 'Gala / Festival',
    items: [
      { offsetFromConcertMinutes: -30, activity: 'Penyambutan Tamu' },
      { offsetFromConcertMinutes: 0, activity: 'Pembukaan Gala' },
      { offsetFromConcertMinutes: 50, activity: 'Intermission (20 Menit)' },
      { offsetFromConcertMinutes: 70, activity: 'Bagian Kedua' },
      { offsetFromConcertMinutes: 140, activity: 'Selesai & Curtain Call' },
    ],
  },
];

export function buildRundownFromTemplate(
  templateId: string,
  concertTime: string,
  openGate?: string
): DynamicRundownItem[] {
  const parsedConcert = parseTimeString(concertTime);
  if (!parsedConcert) return [];

  const template = RUNDOWN_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return [];

  const tz = parsedConcert.timezone;
  const normalizedConcert = formatTimeString(parsedConcert.hours, parsedConcert.minutes, tz);

  const parsedGate = parseTimeString(openGate);
  const effectiveGate =
    parsedGate && isTimeBefore(openGate, normalizedConcert)
      ? formatTimeString(parsedGate.hours, parsedGate.minutes, tz)
      : calculateDefaultOpenGate(normalizedConcert, 90);

  const items: DynamicRundownItem[] = [
    { time: effectiveGate, activity: 'Registrasi & Open Gate' },
  ];

  for (const item of template.items) {
    const rowTime = shiftTimeMinutes(normalizedConcert, item.offsetFromConcertMinutes, {
      clampSameDay: item.offsetFromConcertMinutes < 0,
    });
    if (item.offsetFromConcertMinutes < 0 && !isTimeBefore(effectiveGate, rowTime)) {
      continue;
    }
    items.push({ time: rowTime, activity: item.activity });
  }

  return items;
}

export function applySchedulePreset(
  presetId: string,
  timezone = 'WIB'
): { time: string; openGate: string; rundown: DynamicRundownItem[] } | null {
  const preset = CONCERT_TIME_PRESETS.find((p) => p.id === presetId);
  if (!preset) return null;

  const parsedPresetTime = parseTimeString(preset.time);
  if (!parsedPresetTime) return null;

  const targetTz = timezone || parsedPresetTime.timezone;
  const time = formatTimeString(parsedPresetTime.hours, parsedPresetTime.minutes, targetTz);
  const openGate = calculateDefaultOpenGate(time, preset.openGateOffsetMinutes);
  const rundown = buildRundownFromTemplate(preset.defaultRundownTemplate, time, openGate);

  return { time, openGate, rundown };
}
