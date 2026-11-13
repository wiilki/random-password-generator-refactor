/** Pure password generation logic. No storage, network requests, or Math.random(). */
export const CHARACTER_SETS = Object.freeze({
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
});

export const AMBIGUOUS_CHARACTERS = 'O0oIl1|';
const UINT32_RANGE = 2 ** 32;

function cryptoRandomWord() {
  if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
    throw new Error('A secure browser context with Web Crypto is required to generate passwords.');
  }
  const word = new Uint32Array(1);
  globalThis.crypto.getRandomValues(word);
  return word[0];
}

/** Rejection sampling prevents modulo bias when a pool size does not divide 2^32. */
export function secureRandomInt(maxExclusive, randomWord = cryptoRandomWord) {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
    throw new RangeError('The random upper bound must be between 1 and 2^32.');
  }
  const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  let value;
  do {
    value = randomWord();
    if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new TypeError('The random source must return a 32-bit unsigned integer.');
    }
  } while (value >= limit);
  return value % maxExclusive;
}

export function getCharacterSets(options) {
  if (!options || typeof options !== 'object') {
    throw new TypeError('Password options are required.');
  }
  const names = Object.keys(CHARACTER_SETS).filter((name) => options[name] === true);
  if (names.length === 0) {
    throw new RangeError('Choose at least one character type.');
  }
  const exclude = options.excludeAmbiguous === true;
  const sets = names.map((name) => {
    const chars = exclude
      ? [...CHARACTER_SETS[name]].filter((char) => !AMBIGUOUS_CHARACTERS.includes(char)).join('')
      : CHARACTER_SETS[name];
    if (!chars) throw new RangeError(`No characters remain in ${name}.`);
    return chars;
  });
  return sets;
}

export function validateOptions(options) {
  const sets = getCharacterSets(options);
  if (!Number.isInteger(options.length) || options.length < 8 || options.length > 128) {
    throw new RangeError('Password length must be a whole number between 8 and 128.');
  }
  if (options.length < sets.length) {
    throw new RangeError('Password length must accommodate every selected character type.');
  }
  return sets;
}

/** Each chosen set appears at least once; every random choice uses Web Crypto. */
export function generatePassword(options, randomWord = cryptoRandomWord) {
  const sets = validateOptions(options);
  const pool = sets.join('');
  const password = sets.map((set) => set[secureRandomInt(set.length, randomWord)]);
  while (password.length < options.length) {
    password.push(pool[secureRandomInt(pool.length, randomWord)]);
  }
  for (let i = password.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1, randomWord);
    [password[i], password[j]] = [password[j], password[i]];
  }
  return password.join('');
}

/** Upper bound only; forced inclusion means real entropy is not exactly length * log2(pool). */
export function estimatePasswordSpace(options) {
  const sets = validateOptions(options);
  const poolSize = sets.join('').length;
  return { poolSize, bitsUpperBound: options.length * Math.log2(poolSize) };
}

export function strengthFromBits(bits) {
  if (bits < 40) return { label: 'Low', level: 1 };
  if (bits < 60) return { label: 'Fair', level: 2 };
  if (bits < 80) return { label: 'Strong', level: 3 };
  return { label: 'Excellent', level: 4 };
}
