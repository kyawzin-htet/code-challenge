# FluxSwap Currency Swap

FluxSwap is a responsive currency swap form built for Problem 2 of the 99Tech code challenge. It lets a user choose two priced assets, enter a swap amount, preview the estimated receive amount after fees, and submit a simulated swap with loading and confirmation states.

The app uses Vite with vanilla JavaScript, modular CSS, live price data, real token SVG assets, and in-memory mock balances.

## Requirements Covered

- Currency swap form for exchanging one asset into another
- Token selectors for source and destination currencies
- Live price fetching from the provided Switcheo price endpoint
- Exchange-rate calculation using token USD prices
- Input validation and user-facing error messages
- Simulated backend interaction with a loading state
- Attractive dark UI with responsive desktop and mobile layouts
- Vite-based development workflow

## Tech Stack

- Vite
- Vanilla JavaScript
- HTML
- CSS
- Remote token SVG assets from the Switcheo token icon repository

## Getting Started

From this folder:

```bash
cd src/problem2
npm install
npm run dev
```

Open the local URL printed by Vite, usually:


## Build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```text
src/problem2
├── index.html
├── package.json
├── src
│   ├── app
│   │   └── createSwapApp.js
│   ├── components
│   │   ├── marketList.js
│   │   ├── sidebarMenu.js
│   │   ├── statsPanel.js
│   │   └── tokenControls.js
│   ├── config
│   │   └── constants.js
│   ├── data
│   │   ├── balances.js
│   │   ├── fallbackPrices.js
│   │   └── featuredMarkets.js
│   ├── services
│   │   └── priceService.js
│   ├── styles
│   │   └── main.css
│   ├── utils
│   │   ├── amounts.js
│   │   ├── formatters.js
│   │   ├── tokenBadges.js
│   │   └── wait.js
│   └── main.js
├── script.js
└── style.css
```

Root `script.js` and `style.css` are compatibility shims. The actual application entry point is `src/main.js`, and the primary stylesheet is `src/styles/main.css`.

## Data Sources

### Live Token Prices

Prices are fetched from:

```text
https://interview.switcheo.com/prices.json
```

The app normalizes this response by:

- Removing entries with missing currency values
- Removing entries with invalid, missing, or non-positive prices
- Keeping the latest price for each currency when duplicates exist
- Sorting popular tokens first, then sorting the rest alphabetically

### Token SVG Assets

Token images use the Switcheo token icon repository:

```text
https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{TOKEN}.svg
```

Example:

```text
https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg
```

If an SVG fails to load, the UI falls back to a generated local badge so the layout remains stable.

## Mock And Constant Data

The app intentionally mixes live prices with mock UI and balance data. The following values are constant or simulated.

### App Constants

Defined in `src/config/constants.js`:

| Name | Value | Purpose |
| --- | --- | --- |
| `PRICE_ENDPOINT` | `https://interview.switcheo.com/prices.json` | Remote price API |
| `PLATFORM_FEE` | `0.0018` | Simulated 0.18% swap fee |
| `DEFAULT_FROM_TOKEN` | `SWTH` | Initial pay token |
| `DEFAULT_TO_TOKEN` | `USDC` | Initial receive token |
| `POPULAR_TOKEN_ORDER` | `SWTH`, `USDC`, `ETH`, `WBTC`, `ATOM`, `OSMO`, `KUJI`, `OKB`, `ZIL`, `USD` | Preferred token display order |

### Mock Balances

Defined in `src/data/balances.js`. These balances are not fetched from a wallet or backend.

| Token | Mock Balance |
| --- | ---: |
| `SWTH` | `519000` |
| `USDC` | `12684.03` |
| `ETH` | `4.26` |
| `WBTC` | `0.48` |
| `ATOM` | `930` |
| `OSMO` | `18400` |
| `KUJI` | `2100` |
| `OKB` | `90` |
| `ZIL` | `71000` |
| `USD` | `5000` |

If a valid priced token exists but does not have a predefined balance, the app creates a mock fallback balance using:

```js
Math.max(12, 2400 / token.price)
```

Balances are updated only in memory after a simulated swap. Refreshing the page resets them.

### Fallback Prices

Defined in `src/data/fallbackPrices.js`. These are used only if the live price API fails.

| Token | Date | Price |
| --- | --- | ---: |
| `USD` | `2023-08-29T07:10:30.000Z` | `1` |
| `USDC` | `2023-08-29T07:10:40.000Z` | `0.9998782611186441` |
| `ETH` | `2023-08-29T07:10:52.000Z` | `1645.9337373737374` |
| `WBTC` | `2023-08-29T07:10:52.000Z` | `26002.82202020202` |
| `ATOM` | `2023-08-29T07:10:50.000Z` | `7.186657333333334` |
| `OSMO` | `2023-08-29T07:10:50.000Z` | `0.3772974333333333` |
| `SWTH` | `2023-08-29T07:10:45.000Z` | `0.004039850455012084` |
| `KUJI` | `2023-08-29T07:10:45.000Z` | `0.675` |
| `OKB` | `2023-08-29T07:10:40.000Z` | `42.97562059322034` |
| `ZIL` | `2023-08-29T07:10:50.000Z` | `0.01651813559322034` |

### Featured Market Display Data

Defined in `src/data/featuredMarkets.js`. These values power the Live Prices card display.

| Token | Display Name | Display Change | Notes |
| --- | --- | ---: | --- |
| `ETH` | Ethereum | `+2.4%` | Static display metadata |
| `WBTC` | Bitcoin | `+1.8%` | Static display metadata |
| `ATOM` | Cosmos | `-0.5%` | Static display metadata |
| `SWTH` | Switcheo | `+5.2%` | Static display metadata |

The token prices in this card come from the live API or fallback prices. The percentage changes are mocked and are not calculated from historical price data.

### Simulated Backend Behavior

The submit action is mocked. When the form has a valid quote:

1. The button enters a loading state.
2. The app waits `1100ms`.
3. Mock balances are updated in memory.
4. A confirmation message is shown.
5. The amount input is cleared.

No real wallet, blockchain transaction, or backend API request is performed.

## Swap Calculation

The receive quote is calculated with USD prices:

```js
grossReceive = amount * fromToken.price / toToken.price
netReceive = grossReceive * (1 - PLATFORM_FEE)
```

The displayed fee is:

```js
feeAmount = grossReceive * PLATFORM_FEE
```

## Validation Rules

The form validates that:

- Both selected tokens have valid prices
- The pay and receive tokens are different
- The entered amount is a positive finite number
- The entered amount does not exceed the mock balance
- The swap value is at least `$0.50`

When validation fails, the primary button is disabled and the UI shows a helpful message.

## UI And Responsive Behavior

- The design uses a black background, dark cards, subtle borders, and muted yellow/gold accents.
- On large screens, the Swap and Live Prices cards sit side by side in a two-column grid.
- On small screens, those sections stack into a single-column layout.
- Statistics and feature cards adapt to available width.
- A page loader is shown while market data is being prepared.
- The Connect Wallet button is visual-only for this challenge.

## Known Limitations

- Wallet connection is not implemented.
- Swaps are simulated and do not submit to a backend.
- Balances are mock values stored in memory.
- Live price percentage changes are static display values.
- Fallback prices are fixed historical constants from `2023-08-29`.
- Token SVGs depend on the remote GitHub raw asset URL, with local generated fallbacks for failed images.
