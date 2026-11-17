import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTimeString,
  formatTimeString,
  calculateDefaultOpenGate,
  generateDynamicRundown,
  isTimeBefore,
  parseDateFlexible,
  normalizeTimeString,
} from './timeUtils.ts';

test('parseTimeString handles 24h, dot separator, single-digit hour, and 12h AM/PM formats', () => {
  assert.deepEqual(parseTimeString('14:21 WIB'), {
    hours: 14,
    minutes: 21,
    totalMinutes: 861,
    raw24: '14:21',
    timezone: 'WIB',
  });

  assert.deepEqual(parseTimeString('14.21 WITA'), {
    hours: 14,
    minutes: 21,
    totalMinutes: 861,
    raw24: '14:21',
    timezone: 'WITA',
  });

  assert.deepEqual(parseTimeString('9:05'), {
    hours: 9,
    minutes: 5,
    totalMinutes: 545,
    raw24: '09:05',
    timezone: 'WIB',
  });

  assert.deepEqual(parseTimeString('02:21 PM'), {
    hours: 14,
    minutes: 21,
    totalMinutes: 861,
    raw24: '14:21',
    timezone: 'WIB',
  });

  assert.deepEqual(parseTimeString('12:15 AM WIT'), {
    hours: 0,
    minutes: 15,
    totalMinutes: 15,
    raw24: '00:15',
    timezone: 'WIT',
  });

  assert.equal(parseTimeString('25:99'), null);
  assert.equal(parseTimeString(''), null);
});

test('calculateDefaultOpenGate computes 90 minutes before concert time', () => {
  assert.equal(calculateDefaultOpenGate('14:21 WIB'), '12:51 WIB');
  assert.equal(calculateDefaultOpenGate('19:30 WIB'), '18:00 WIB');
  assert.equal(calculateDefaultOpenGate('09:00 WITA'), '07:30 WITA');
  assert.equal(calculateDefaultOpenGate('00:30 WIB'), '00:00 WIB');
});

test('isTimeBefore enforces chronological ordering across formats', () => {
  assert.equal(isTimeBefore('12:51 WIB', '14:21 WIB'), true);
  assert.equal(isTimeBefore('18:00 WIB', '14:21 WIB'), false);
  assert.equal(isTimeBefore('14:21 WIB', '14:21 WIB'), false);
  assert.equal(isTimeBefore('1.00 PM', '14.21 WIB'), true);
});

test('generateDynamicRundown aligns rundown items to daytime concert', () => {
  const rundown = generateDynamicRundown('14:21 WIB');
  assert.deepEqual(rundown, [
    { time: '12:51 WIB', activity: 'Registrasi & Open Gate' },
    { time: '13:51 WIB', activity: 'Pintu Main Hall Dibuka' },
    { time: '14:21 WIB', activity: 'Pertunjukan Utama' },
    { time: '16:21 WIB', activity: 'Selesai & Curtain Call' },
  ]);

  const customGate = generateDynamicRundown('14:00 WIB', '13:30 WIB');
  assert.deepEqual(customGate, [
    { time: '13:30 WIB', activity: 'Registrasi & Open Gate' },
    { time: '14:00 WIB', activity: 'Pertunjukan Utama' },
    { time: '16:00 WIB', activity: 'Selesai & Curtain Call' },
  ]);
});

test('parseDateFlexible handles Indonesian, English, ISO, and DMY dates', () => {
  const idDate = parseDateFlexible('Minggu, 22 November 2026');
  assert.equal(idDate?.iso, '2026-11-22');
  assert.equal(idDate?.formattedID, 'Minggu, 22 November 2026');

  const isoDate = parseDateFlexible('2026-11-22');
  assert.equal(isoDate?.iso, '2026-11-22');
  assert.equal(isoDate?.formattedID, 'Minggu, 22 November 2026');

  const enDate = parseDateFlexible('Sunday, Nov 22, 2026');
  assert.equal(enDate?.iso, '2026-11-22');
  assert.equal(enDate?.shortMonthID, 'NOV');

  const dmyDate = parseDateFlexible('22/11/2026');
  assert.equal(dmyDate?.iso, '2026-11-22');
  assert.equal(dmyDate?.formattedID, 'Minggu, 22 November 2026');

  assert.equal(formatTimeString(9, 5, 'WIB'), '09:05 WIB');
  assert.equal(normalizeTimeString('2.21 PM WITA'), '14:21 WITA');
});
