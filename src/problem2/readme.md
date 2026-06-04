# FluxSwap Currency Swap

A responsive currency swap interface for Problem 2 of the 99Tech code challenge. The app lets users choose two priced assets, enter an amount, preview the estimated receive amount, and submit a simulated swap with a short loading state.

## Features

- Vite-powered vanilla JavaScript app
- Live token prices from `https://interview.switcheo.com/prices.json`
- Fallback prices when the API is unavailable
- Latest-price normalization for duplicate token entries
- Token selectors with reusable badge rendering
- Amount sanitization and validation
- Balance checks, minimum swap value, fee calculation, and quote preview
- Max amount and switch-token controls
- Simulated backend submission with loading and confirmation states
- Responsive layout with a mobile sidebar menu
- Reusable module structure for components, services, data, and utilities

## Getting Started

From this folder:

```bash
cd src/problem2
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

## Build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Architecture Notes

- `src/main.js` collects DOM references and starts the app.
- `src/app/createSwapApp.js` coordinates swap state, validation, quotes, and submit behavior.
- `src/components` contains reusable UI behavior/rendering modules.
- `src/services/priceService.js` owns price fetching and normalization.
- `src/data` stores mock balances, fallback prices, and featured market metadata.
- `src/utils` contains reusable formatting, amount parsing, token badge, and async helpers.
- Root `script.js` and `style.css` are compatibility shims; the app uses `src/main.js` and `src/styles/main.css`.

## Interaction Details

The submit action is intentionally simulated. After a valid quote is submitted, the button enters a loading state, waits briefly, updates mock balances in memory, and shows a confirmation message. This keeps the experience realistic without requiring a backend service.
