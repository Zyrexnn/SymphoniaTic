import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTicketScanPayload } from './qrPayload.ts';

describe('normalizeTicketScanPayload', () => {
  it('strips QR- prefix and trims whitespace with uppercase normalization', () => {
    assert.equal(normalizeTicketScanPayload('  qr-sym-678221-f-9  '), 'SYM-678221-F-9');
    assert.equal(normalizeTicketScanPayload('QR-SYM-7K9P2X8M'), 'SYM-7K9P2X8M');
    assert.equal(normalizeTicketScanPayload('sym-100001'), 'SYM-100001');
  });

  it('extracts ticket code and seat query param from /ticket/ URLs', () => {
    assert.equal(
      normalizeTicketScanPayload('https://symphoniatic.id/ticket/SYM-678221?seat=F-9'),
      'SYM-678221-F-9'
    );
    assert.equal(
      normalizeTicketScanPayload('http://localhost:4321/ticket/QR-SYM-678221'),
      'SYM-678221'
    );
    assert.equal(
      normalizeTicketScanPayload('http://localhost:4321/ticket/SYM-678221-F-9?seat=F-9'),
      'SYM-678221-F-9'
    );
  });

  it('extracts ticket code from /redeem?code= URLs', () => {
    assert.equal(
      normalizeTicketScanPayload('http://localhost:4321/redeem?code=QR-SYM-7K9P2X8M-A-2'),
      'SYM-7K9P2X8M-A-2'
    );
  });

  it('returns empty string for blank inputs', () => {
    assert.equal(normalizeTicketScanPayload('   '), '');
  });
});
