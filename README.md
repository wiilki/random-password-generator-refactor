# Lockbox — private password generator

A clean, fast, and accessible password generator that works **entirely in your browser**.

**Website:** [wiilki.github.io/random-password-generator-refactor](https://wiilki.github.io/random-password-generator-refactor/)

## Features

- Uses `crypto.getRandomValues()` rather than `Math.random()`. Rejection sampling avoids modulo bias.
- Select password lengths from 8 to 128 characters, with lowercase, uppercase, numbers, symbols, and an option to exclude commonly confused characters.
- Guarantees at least one character from **each enabled set** before securely shuffling the result.
- Includes Balanced, Maximum, and PIN-only presets, plus show/hide, regenerate, and copy actions.
- Adapts to desktop and mobile with accessible labels, focus states, and live feedback.
- **No logins, server, analytics, dependency CDN, network calls, or saved passwords.** Passwords exist only in memory until the page is closed. Copying places the password on your system clipboard, which is managed by your device.

## Running locally

Use a simple HTTP server from the repository root (ES modules need a server in most browsers):

```sh
python3 -m http.server 8000
```

Visit `http://localhost:8000`. Static hosting (including GitHub Pages) requires no build step.

## Tests

Node.js 20+ is recommended (CI uses 22).

```sh
npm test
```

## Security notes

- The generator **requires the Web Crypto API**. If unavailable, it displays an error instead of silently falling back to weaker randomness.
- The on-screen bit count is an **upper bound** from `length × log₂(character pool size)`; guaranteed character-type inclusion changes the distribution, so it must **not** be interpreted as exact entropy or as a promise that a password is uncrackable.
- The strength label is an indicative estimate based on that upper bound. Real-world security also depends on account protection, phishing resistance, credential reuse, and password handling.
- Prefer a dedicated password manager, a unique password per account, and multi-factor authentication. The PIN preset is for services that **specifically require digits** and should not be mistaken for a strong general-purpose account password.
- The browser clipboard may be read by other applications. Clear your clipboard where appropriate and avoid copying passwords on shared devices.

## Tech

HTML, CSS, JavaScript ES modules, browser Web Crypto API, and Node's built-in test runner. No third-party runtime dependencies.

The previous classroom password generator used `prompt()`, `confirm()`, and `Math.random()`. This redesign replaces it with an interactive, security-conscious UI and testable generation logic.
