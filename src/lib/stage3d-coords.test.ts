import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRowIndex,
  projectSeatsTo3D,
  getOverviewCameraPose,
  getBalconyCameraPose,
  getSeatViewCameraPose,
  getZoneViewCameraPose,
  STAGE_FOCUS_TARGET,
} from './stage3d-coords.ts';

test('getRowIndex maps A-Z and extra R-rows consistently', () => {
  assert.equal(getRowIndex('A'), 0);
  assert.equal(getRowIndex('D'), 3);
  assert.equal(getRowIndex('K'), 10);
  assert.equal(getRowIndex('L'), 11);
  assert.equal(getRowIndex('R1'), 26);
  assert.equal(getRowIndex(''), 0);
  assert.equal(getRowIndex('??'), 0);
});

test('projectSeatsTo3D centers stage X=0 and elevates rear rows progressively', () => {
  const projected = projectSeatsTo3D([
    {
      seatCode: 'A-7',
      rowLabel: 'A',
      seatNumber: 7,
      x: 260,
      y: 126,
      categoryId: 'vip',
      status: 'AVAILABLE',
    },
    {
      seatCode: 'D-10',
      rowLabel: 'D',
      seatNumber: 10,
      x: 346,
      y: 210,
      categoryId: 'cat1',
      status: 'AVAILABLE',
    },
  ]);

  assert.equal(projected.length, 2);
  const front = projected[0];
  const back = projected[1];

  assert.equal(front.x3d, 0);
  assert.equal(front.y3d, 0);
  assert.ok(front.z3d > 0);
  assert.ok(back.x3d > 0);
  assert.ok(back.y3d > front.y3d);
  assert.ok(back.z3d > front.z3d);
});

test('getSeatViewCameraPose places eye level above seat facing orchestra stage', () => {
  const [seat] = projectSeatsTo3D([
    {
      seatCode: 'B-5',
      rowLabel: 'B',
      seatNumber: 5,
      x: 174,
      y: 154,
      categoryId: 'vip',
      status: 'AVAILABLE',
    },
  ]);

  const pose = getSeatViewCameraPose(seat);
  assert.equal(pose.position[0], seat.x3d);
  assert.ok(Math.abs(pose.position[1] - (seat.y3d + 1.15)) < 1e-6);
  assert.equal(pose.position[2], seat.z3d);
  assert.deepEqual(pose.target, STAGE_FOCUS_TARGET);
});

test('getZoneViewCameraPose picks front-center seat of target zone and falls back when missing', () => {
  const points = projectSeatsTo3D([
    { seatCode: 'A-1', rowLabel: 'A', seatNumber: 1, x: 62, y: 126, categoryId: 'vip', status: 'AVAILABLE' },
    { seatCode: 'A-7', rowLabel: 'A', seatNumber: 7, x: 230, y: 126, categoryId: 'vip', status: 'AVAILABLE' },
    { seatCode: 'F-7', rowLabel: 'F', seatNumber: 7, x: 230, y: 266, categoryId: 'fest', status: 'AVAILABLE' },
  ]);

  const vipPose = getZoneViewCameraPose(points, 'vip');
  assert.equal(vipPose.position[0], points[1].x3d);
  assert.deepEqual(vipPose.target, STAGE_FOCUS_TARGET);

  const fallbackPose = getZoneViewCameraPose(points, 'nonexistent');
  const overview = getOverviewCameraPose(points);
  assert.deepEqual(fallbackPose, overview);
});

test('getOverviewCameraPose handles empty seat array without NaN', () => {
  const pose = getOverviewCameraPose([]);
  assert.ok(pose.position.every((n) => Number.isFinite(n)));
  assert.ok(pose.target.every((n) => Number.isFinite(n)));
});

test('getBalconyCameraPose elevates camera behind audience facing stage', () => {
  const points = projectSeatsTo3D([
    { seatCode: 'H-7', rowLabel: 'H', seatNumber: 7, x: 260, y: 322, categoryId: 'fest', status: 'AVAILABLE' },
  ]);
  const pose = getBalconyCameraPose(points);
  assert.ok(pose.position[1] > 5);
  assert.ok(pose.position[2] > points[0].z3d);
  assert.ok(pose.target[2] < 0);
});
