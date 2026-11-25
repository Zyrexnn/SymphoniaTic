import test from 'node:test';
import assert from 'node:assert/strict';
import { applySchedulePreset, buildRundownFromTemplate } from './concertSchedulePresets.ts';
import { isSalesCutoffAfterConcert } from './timeUtils.ts';

test('applySchedulePreset evening returns canonical WIB schedule and 6-row symphony rundown', () => {
  const res = applySchedulePreset('evening');
  assert.ok(res);
  assert.equal(res.time, '19:30 WIB');
  assert.equal(res.openGate, '18:00 WIB');
  assert.deepEqual(res.rundown[0], { time: '18:00 WIB', activity: 'Registrasi & Open Gate' });
  assert.equal(res.rundown[res.rundown.length - 1].time, '21:45 WIB');
});

test('applySchedulePreset carries through WITA timezone', () => {
  const res = applySchedulePreset('evening', 'WITA');
  assert.ok(res);
  assert.equal(res.time, '19:30 WITA');
  assert.equal(res.openGate, '18:00 WITA');
  assert.equal(res.rundown[0].time, '18:00 WITA');
  assert.equal(res.rundown[res.rundown.length - 1].time, '21:45 WITA');
});

test('applySchedulePreset returns null for unknown id', () => {
  assert.equal(applySchedulePreset('unknown-preset'), null);
});

test('buildRundownFromTemplate drops negative-offset rows that are not after openGate', () => {
  const rundown = buildRundownFromTemplate('symphony', '19:30 WIB', '19:15 WIB');
  assert.equal(rundown[0].time, '19:15 WIB');
  assert.equal(
    rundown.some((item) => item.activity === 'Pintu Main Hall Dibuka'),
    false
  );
});

test('isSalesCutoffAfterConcert compares UTC instant accurately across Indonesian timezones', () => {
  // 20:00 WITA on 2027-04-18 is 12:00 UTC; 12:30Z is after concert start
  assert.equal(
    isSalesCutoffAfterConcert('2027-04-18T12:30:00Z', 'Minggu, 18 April 2027', '20:00 WITA'),
    true
  );
  assert.equal(
    isSalesCutoffAfterConcert('2027-04-18T11:30:00Z', 'Minggu, 18 April 2027', '20:00 WITA'),
    false
  );
  assert.equal(
    isSalesCutoffAfterConcert('invalid-date', 'Minggu, 18 April 2027', '20:00 WITA'),
    false
  );
});
