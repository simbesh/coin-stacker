# Price Query API - Refactored Structure

## Overview
The price-query API has been refactored from a single 530-line file into a modular, maintainable structure. Each exchange's logic is now encapsulated in its own file or folder.

## Directory Structure

```
src/app/api/price-query/
├── route.ts                 # Main API route handler (61 lines)
├── types.ts                 # Common types and interfaces
├── exchanges/
│   ├── index.ts            # Exports all exchange handlers
│   ├── ccxt-helper.ts      # Shared helper for CCXT-based exchanges
│   ├── btcmarkets.ts       # BTC Markets exchange
│   ├── independentreserve.ts
│   ├── kraken.ts
│   ├── luno.ts
│   ├── okx.ts
│   ├── coinspot.ts         # CoinSpot exchange
│   ├── coinjar.ts
│   ├── bitaroo.ts
│   ├── day1x.ts
│   ├── wayex.ts
│   ├── coinstash.ts        # Quote-based exchanges
│   ├── cointree.ts
│   ├── digitalsurge.ts
│   ├── hardblock.ts
│   └── swyftx/             # Complex exchange with helpers
│       ├── index.ts
│       └── helpers.ts
└── README.md
```

## Exchange Categories

### 1. CCXT-based Exchanges
These exchanges use the CCXT library and share common logic:
- `btcmarkets.ts`
- `independentreserve.ts`
- `kraken.ts`
- `luno.ts`
- `okx.ts`

All use the shared `ccxt-helper.ts` for common order book fetching logic.

### 2. Custom API Exchanges
These exchanges have custom API implementations:
- `coinspot.ts` - CoinSpot API
- `coinjar.ts` - CoinJar API
- `bitaroo.ts` - Bitaroo API (BTC/AUD only)
- `day1x.ts` - Day1x API
- `wayex.ts` - Wayex API (requires instrument lookup)

### 3. Quote/Mock-based Exchanges
These exchanges use price quotes rather than full order books:
- `swyftx/` - Swyftx with token refresh mechanism
- `coinstash.ts` - Coinstash oracle API
- `cointree.ts` - Cointree with liquidity limits
- `digitalsurge.ts` - Digital Surge broker API
- `hardblock.ts` - Hardblock (BTC/AUD only)

## Key Files

### `types.ts`
Defines common interfaces:
- `OrderBook` - Standard order book structure
- `ExchangeHandler` - Function signature for exchange handlers
- `MarketNotFoundError` - Custom error class

### `exchanges/index.ts`
Central export point that:
- Imports all exchange handlers
- Exports `orderbookMethods` mapping
- Exports `supportedExchanges` list

### `route.ts`
Simplified main handler that:
- Imports exchange handlers from `./exchanges`
- Orchestrates parallel order book fetching
- Handles errors and aggregates results

## Benefits

1. **Maintainability**: Each exchange is isolated in its own file
2. **Extensibility**: Adding new exchanges is straightforward
3. **Testability**: Individual exchanges can be tested independently
4. **Readability**: Main route file reduced from 530 to 61 lines
5. **Reusability**: Common logic (like CCXT helper) is shared
6. **Organization**: Related code (like Swyftx helpers) is grouped together

## Adding a New Exchange

1. Create a new file in `exchanges/` (e.g., `newexchange.ts`)
2. Implement the `ExchangeHandler` interface
3. Export the handler function
4. Import and add to `exchanges/index.ts`:
   ```typescript
   import { getNewExchangeOrderBook } from './newexchange'
   
   export const orderbookMethods = {
     // ... existing
     newexchange: getNewExchangeOrderBook,
   }
   
   export const supportedExchanges = [
     // ... existing
     'newexchange',
   ]
   ```
5. The exchange will automatically be included in the API

## Migration Notes

- All functionality from the original 530-line file has been preserved
- No changes to the API interface or response format
- Exchange logic is identical, just organized differently
- Swyftx database helpers moved to `exchanges/swyftx/helpers.ts`
