import test from 'node:test';
import assert from 'node:assert/strict';
import { cn } from './utils.ts';

test('cn merges classes and resolves tailwind conflicts correctly', () => {
  assert.equal(cn('px-2 py-1', 'bg-blue-500'), 'px-2 py-1 bg-blue-500');
  assert.equal(cn('px-2 py-1', false && 'hidden', 'px-4'), 'py-1 px-4');
  assert.equal(cn('text-sm font-bold', undefined, null, 'text-lg'), 'font-bold text-lg');
});
