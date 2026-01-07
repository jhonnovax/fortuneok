# Financial Modeling Prep (FMP) API - Current Setup

## ✅ Implementation Complete

The app now uses **ONLY Financial Modeling Prep API** for both symbol search and stock price quotes.

## Current Behavior

### With Free Tier FMP API Key:
```javascript
// All stock/ETF/crypto prices default to $1
VOO: 387.18 shares × $1 = $387.18
AAPL: 200.32 shares × $1 = $200.32
MSFT: 192.16 shares × $1 = $192.16
```

### Why Price = $1:
- **FMP free tier has NO working price endpoints**
- All v3 endpoints return: `"Legacy Endpoint - no longer supported"`
- All stable endpoints return: `[]` (empty arrays)
- Code automatically falls back to `price = $1` for all symbols

## What Works (Free Tier)

### ✅ Symbol Search
- Search for stocks, ETFs, bonds, crypto
- 250 API calls/day
- Works perfectly via `/api/symbols/search`

### ✅ Asset Tracking
- Track shares/quantities
- Organize by categories
- View allocation percentages (based on shares × $1)
- All app functionality works (just with $1 prices)

### ❌ Price Quotes
- No real-time prices
- No historical prices
- No market data
- All prices = $1 (fallback)

## To Get Actual Prices

### Option 1: Upgrade FMP Plan (Recommended)

**Starter Plan: $14/month**
- 1,000 API calls/day
- Real-time price quotes
- Historical data
- All endpoints unlocked

**Professional Plan: $59/month**
- Unlimited API calls
- Premium endpoints
- Priority support

Visit: https://financialmodelingprep.com/developer/pricing

### Option 2: Switch to Different API

If you want actual prices without paying, you could switch to:

1. **Twelve Data** (Recommended for free tier)
   - 800 requests/day FREE
   - Real-time prices for US stocks
   - International stocks on paid plan ($29.99/month)
   - See `TWELVE_DATA_SETUP.md` if we switch back

2. **Alpha Vantage**
   - 25 requests/day FREE (very limited)
   - 500 requests/day for $50/month

3. **Yahoo Finance** (via yahoo-finance2)
   - Free but very unreliable
   - Frequent rate limiting (~30/hour)
   - Not recommended

## Files Changed

### Updated Files:
1. **`services/symbolService.js`** - Uses FMP API only
2. **`.env.local`** - Removed `TWELVE_DATA_API_KEY`
3. **`CLAUDE.md`** - Updated documentation

### Removed Files:
- `TWELVE_DATA_SETUP.md` - No longer needed

## Environment Variables

Required:
```env
FMP_API_KEY=gzIXW2luZBncD7GmZRnOvbu5h9cn6Ogs
```

Not needed:
```env
TWELVE_DATA_API_KEY  # Removed
```

## Testing

Test the API:
```bash
curl http://localhost:3000/api/asset | jq '.[] | select(.symbol != null) | {symbol, shares, amount: .currentValuation.amount}'
```

Expected result (free tier):
```json
{
  "symbol": "VOO",
  "shares": 387.1765,
  "amount": 387.1765  // equals shares × 1
}
```

## API Endpoints Attempted

The code tries these FMP endpoints (all fail on free tier):

1. **Stable API**:
   ```
   https://financialmodelingprep.com/stable/quote/{symbols}
   Response: [] (empty)
   ```

2. **V3 API**:
   ```
   https://financialmodelingprep.com/api/v3/quote/{symbols}
   Response: "Legacy Endpoint - no longer supported"
   ```

3. **Fallback**:
   ```javascript
   price = 1  // Used for all symbols
   ```

## Code Implementation

### Location: `services/symbolService.js`

```javascript
// Tries FMP endpoints
const fetchSymbolDataFromAPI = async (symbols) => {
  // Try stable API
  let url = `https://financialmodelingprep.com/stable/quote/${symbolList}?apikey=${process.env.FMP_API_KEY}`;
  let response = await fetch(url);
  let quotes = await response.json();

  // If stable fails, try v3
  if (!Array.isArray(quotes) || quotes.length === 0) {
    url = `https://financialmodelingprep.com/api/v3/quote/${symbolList}?apikey=${process.env.FMP_API_KEY}`;
    response = await fetch(url);
    quotes = await response.json();
  }

  // Both will fail on free tier -> returns empty object
  // Fallback to price = 1 happens in getStockPrices()
};
```

## Recommendations

### For Production Use:
If you're using this app to track real investments:
- ✅ **Upgrade to FMP Starter** ($14/month) for actual prices
- ✅ **Or switch to Twelve Data** (800 free calls/day with real prices for US stocks)

### For Development/Testing:
- ✅ Current setup works fine with `price = $1`
- ✅ All app features functional
- ✅ Good for testing UI/UX
- ❌ Not suitable for real portfolio tracking

## Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Symbol Search | ✅ Working | 250 calls/day |
| US Stock Prices | ❌ Price = $1 | Requires paid plan |
| International Stocks | ❌ Price = $1 | Requires paid plan |
| Crypto Prices | ❌ Price = $1 | Requires paid plan |
| Asset Tracking | ✅ Working | Tracks shares correctly |
| Calculations | ⚠️ Partial | Amount = shares × $1 |

## Next Steps

Choose one:

1. **Keep current setup** - Works for tracking shares only
2. **Upgrade FMP** - $14/month for real prices
3. **Switch to Twelve Data** - Free tier with real US stock prices
4. **Manual price entry** - I can add feature to manually override prices

Let me know which option you'd prefer!
