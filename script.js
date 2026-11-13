import { generatePassword, estimatePasswordSpace, strengthFromBits } from './password-core.mjs';

const byId = (id) => document.getElementById(id);
const elements = {
  password: byId('password'), generate: byId('generate'), copy: byId('copy'),
  copyLabel: byId('copy-label'), status: byId('status'), note: byId('generation-note'),
  visibility: byId('toggle-visibility'), length: byId('length'), slider: byId('length-slider'),
  entropy: byId('entropy'), pool: byId('pool-count'), strength: byId('strength-label'),
  meter: byId('strength-meter'), lowercase: byId('lowercase'), uppercase: byId('uppercase'),
  numbers: byId('numbers'), symbols: byId('symbols'), ambiguous: byId('exclude-ambiguous'),
};
const presets = {
  balanced: { length: 18, lowercase: true, uppercase: true, numbers: true, symbols: true, excludeAmbiguous: true },
  maximum: { length: 32, lowercase: true, uppercase: true, numbers: true, symbols: true, excludeAmbiguous: false },
  pin: { length: 8, lowercase: false, uppercase: false, numbers: true, symbols: false, excludeAmbiguous: false },
};
let visible = true;
let copyResetHandle;

function optionsFromForm() {
  return {
    length: Number(elements.length.value),
    lowercase: elements.lowercase.checked, uppercase: elements.uppercase.checked,
    numbers: elements.numbers.checked, symbols: elements.symbols.checked,
    excludeAmbiguous: elements.ambiguous.checked,
  };
}

function showStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle('is-error', isError);
}

function activatePreset(name) {
  document.querySelectorAll('[data-preset]').forEach((button) => {
    const active = button.dataset.preset === name;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function updateSliderFill() {
  const value = Number(elements.slider.value);
  const progress = ((value - 8) / (128 - 8)) * 100;
  elements.slider.style.setProperty('--range-progress', `${progress}%`);
}

function resetCopyLabel() {
  clearTimeout(copyResetHandle);
  elements.copyLabel.textContent = 'Copy password';
}

function renderPassword() {
  resetCopyLabel();
  try {
    const options = optionsFromForm();
    const password = generatePassword(options);
    const { poolSize, bitsUpperBound } = estimatePasswordSpace(options);
    const { label, level } = strengthFromBits(bitsUpperBound);
    elements.password.value = password;
    elements.copy.disabled = false;
    elements.entropy.textContent = String(Math.floor(bitsUpperBound));
    elements.pool.textContent = String(poolSize);
    elements.strength.textContent = label;
    elements.strength.dataset.level = String(level);
    elements.meter.dataset.level = String(level);
    elements.note.textContent = 'Generated on this device. Never sent or saved anywhere.';
    showStatus('New password generated. Copy it when you’re ready.');
  } catch (error) {
    elements.password.value = '';
    elements.copy.disabled = true;
    elements.entropy.textContent = '—';
    elements.pool.textContent = '—';
    elements.strength.textContent = 'Unavailable';
    elements.strength.dataset.level = '0';
    elements.meter.dataset.level = '0';
    elements.note.textContent = 'Choose valid options to generate a password.';
    showStatus(error instanceof Error ? error.message : 'Could not generate a password.', true);
  }
}

function updateAfterControlChange() {
  activatePreset(null);
  renderPassword();
}

async function copyPassword() {
  const password = elements.password.value;
  if (!password) return;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(password);
    elements.copyLabel.textContent = 'Copied!';
    showStatus('Copied to clipboard. Paste it into your password manager.');
    clearTimeout(copyResetHandle);
    copyResetHandle = setTimeout(resetCopyLabel, 2200);
  } catch {
    elements.password.focus();
    elements.password.select();
    showStatus('Clipboard permission was denied. Your password is selected — copy it manually.', true);
  }
}

function setVisibility(nextVisible) {
  visible = nextVisible;
  elements.password.type = visible ? 'text' : 'password';
  const action = visible ? 'Hide password' : 'Show password';
  elements.visibility.setAttribute('aria-label', action);
  elements.visibility.setAttribute('title', action);
  elements.visibility.setAttribute('aria-pressed', String(visible));
  elements.visibility.classList.toggle('is-hidden', !visible);
}

elements.generate.addEventListener('click', renderPassword);
elements.copy.addEventListener('click', copyPassword);
elements.visibility.addEventListener('click', () => setVisibility(!visible));
elements.slider.addEventListener('input', () => {
  elements.length.value = elements.slider.value;
  updateSliderFill();
  updateAfterControlChange();
});
elements.length.addEventListener('change', () => {
  if (elements.length.value.trim() === '') elements.length.value = '18';
  const value = Number(elements.length.value);
  if (!Number.isInteger(value) || value < 8 || value > 128) {
    renderPassword();
    return;
  }
  elements.slider.value = String(value);
  updateSliderFill();
  updateAfterControlChange();
});
[elements.lowercase, elements.uppercase, elements.numbers, elements.symbols, elements.ambiguous]
  .forEach((checkbox) => checkbox.addEventListener('change', updateAfterControlChange));
document.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', () => {
  const preset = presets[button.dataset.preset];
  if (!preset) return;
  elements.length.value = String(preset.length);
  elements.slider.value = String(preset.length);
  elements.lowercase.checked = preset.lowercase;
  elements.uppercase.checked = preset.uppercase;
  elements.numbers.checked = preset.numbers;
  elements.symbols.checked = preset.symbols;
  elements.ambiguous.checked = preset.excludeAmbiguous;
  activatePreset(button.dataset.preset);
  updateSliderFill();
  renderPassword();
}));

updateSliderFill();
renderPassword();
