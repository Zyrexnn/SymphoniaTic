import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isNavItemActive } from './navUtils.ts';

describe('isNavItemActive', () => {
  it('matches exact root path only for Beranda', () => {
    assert.equal(isNavItemActive('/', '/'), true);
    assert.equal(isNavItemActive('/events', '/'), false);
    assert.equal(isNavItemActive('/concert/1', '/'), false);
  });

  it('highlights Jadwal Konser on /events and /concert/[id]', () => {
    assert.equal(isNavItemActive('/events', '/events'), true);
    assert.equal(isNavItemActive('/concert/12', '/events'), true);
    assert.equal(isNavItemActive('/redeem', '/events'), false);
  });

  it('highlights Cek E-Ticket on /redeem and /ticket/[code]', () => {
    assert.equal(isNavItemActive('/redeem', '/redeem'), true);
    assert.equal(isNavItemActive('/ticket/SYM-123', '/redeem'), true);
    assert.equal(isNavItemActive('/events', '/redeem'), false);
  });

  it('matches prefix for other top-level routes', () => {
    assert.equal(isNavItemActive('/edukasi', '/edukasi'), true);
    assert.equal(isNavItemActive('/refund', '/refund'), true);
    assert.equal(isNavItemActive('', '/events'), false);
  });
});
