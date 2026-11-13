import test from 'node:test';
import assert from 'node:assert/strict';
import { AMBIGUOUS_CHARACTERS, CHARACTER_SETS, estimatePasswordSpace, generatePassword, getCharacterSets, secureRandomInt, strengthFromBits } from '../password-core.mjs';

const defaults = { length: 24, lowercase: true, uppercase: true, numbers: true, symbols: true, excludeAmbiguous: false };

// Predictable source tests logic; the default production source remains Web Crypto.
function deterministicWord() {
  let state = 0x12345678;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

test('generates passwords of requested length, including all selected sets', () => {
  for (const length of [8, 16, 32, 128]) {
    const password = generatePassword({ ...defaults, length }, deterministicWord());
    assert.equal(password.length, length);
    for (const set of Object.values(CHARACTER_SETS)) assert.ok([...password].some((c) => set.includes(c)));
  }
});

test('allows one selected character type', () => {
  const password = generatePassword({ length: 20, lowercase: false, uppercase: false, numbers: true, symbols: false }, deterministicWord());
  assert.match(password, /^[0-9]{20}$/);
});

test('excludes ambiguous characters across all character sets', () => {
  const options = { ...defaults, excludeAmbiguous: true };
  for (let i = 0; i < 20; i++) {
    const password = generatePassword(options);
    assert.equal([...password].filter((char) => AMBIGUOUS_CHARACTERS.includes(char)).length, 0);
  }
  assert.ok(getCharacterSets(options).every((set) => set.length > 0));
});

test('rejects missing, noninteger and out-of-bounds settings', () => {
  for (const length of [0, 7, 129, 16.5, NaN, '16']) {
    assert.throws(() => generatePassword({ ...defaults, length }), RangeError);
  }
  assert.throws(() => generatePassword({ ...defaults, lowercase: false, uppercase: false, numbers: false, symbols: false }), /at least one/i);
  assert.throws(() => generatePassword(null), TypeError);
});

test('modulo bias is avoided through rejection sampling', () => {
  let calls = 0;
  const values = [0xffffffff, 42];
  assert.equal(secureRandomInt(10, () => values[calls++]), 2);
  assert.equal(calls, 2);
  assert.throws(() => secureRandomInt(0), RangeError);
  assert.throws(() => secureRandomInt(10, () => -1), TypeError);
});

test('provides a consistent upper bound and qualitative indicator', () => {
  const { poolSize, bitsUpperBound } = estimatePasswordSpace(defaults);
  assert.equal(poolSize, Object.values(CHARACTER_SETS).join('').length);
  assert.equal(bitsUpperBound, 24 * Math.log2(poolSize));
  assert.deepEqual(strengthFromBits(35), { label: 'Low', level: 1 });
  assert.deepEqual(strengthFromBits(50), { label: 'Fair', level: 2 });
  assert.deepEqual(strengthFromBits(70), { label: 'Strong', level: 3 });
  assert.deepEqual(strengthFromBits(100), { label: 'Excellent', level: 4 });
});

test('generates different values using browser/Node Web Crypto by default', () => {
  const passwords = new Set(Array.from({ length: 12 }, () => generatePassword(defaults)));
  assert.equal(passwords.size, 12);
});
