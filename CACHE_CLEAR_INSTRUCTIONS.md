# Clearing Redis Cache for Stock Prices

## When to Clear Cache

You need to clear the Redis cache when:
- ✅ Switching to a new stock price API
- ✅ Stock prices show incorrect values (e.g., price=$1)
- ✅ After updating the Twelve Data API key
- ✅ Testing new symbol price fetching

## Quick Clear Command

Run this from the project root:

```bash
node -e "
const Redis = require('ioredis');
const redis = new Redis('$REDIS_URL' || process.env.REDIS_URL);
redis.keys('symbol_data:*').then(keys => {
  console.log('Deleting', keys.length, 'cached symbols...');
  return keys.length > 0 ? redis.del(...keys) : 0;
}).then(deleted => {
  console.log('Deleted', deleted, 'keys');
  redis.quit();
}).catch(err => {
  console.error('Error:', err);
  redis.quit();
});
"
```

## Or Use the Full Command

```bash
node -e "
const Redis = require('ioredis');
const redis = new Redis('rediss://XXX');
redis.keys('symbol_data:*').then(keys => {
  console.log('Deleting', keys.length, 'cached symbols...');
  if (keys.length > 0) {
    return redis.del(...keys);
  }
  return 0;
}).then(deleted => {
  console.log('Deleted', deleted, 'keys');
  redis.quit();
}).catch(err => {
  console.error('Error:', err);
  redis.quit();
});
"
```

## What Gets Cleared

- All cached stock/ETF/crypto prices
- Cache key pattern: `symbol_data:SYMBOL` (e.g., `symbol_data:AAPL`)
- TTL: 4 hours (symbols will be re-fetched from Twelve Data API)

## After Clearing

1. Restart the dev server (optional):
   ```bash
   npm run dev
   ```

2. Test the API:
   ```bash
   curl http://localhost:3000/api/asset | jq '.[] | select(.symbol != null) | {symbol, shares, amount: .currentValuation.amount}'
   ```

3. Verify prices are correct:
   - VOO should be ~$636/share
   - AAPL should be ~$263/share
   - MSFT should be ~$477/share

## Checking Cache Contents

To see what's currently cached:

```bash
node -e "
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);
redis.keys('symbol_data:*').then(keys => {
  console.log('Found', keys.length, 'cached symbols');
  if (keys.length > 0) {
    return Promise.all(keys.slice(0, 5).map(k =>
      redis.get(k).then(v => ({key: k, value: JSON.parse(v)}))
    ));
  }
  return [];
}).then(data => {
  console.log('Sample cached data:');
  console.log(JSON.stringify(data, null, 2));
  redis.quit();
}).catch(err => {
  console.error('Error:', err);
  redis.quit();
});
"
```

## Cache TTL

- **Duration**: 4 hours
- **Location**: `services/symbolService.js:4`
- **Constant**: `CACHE_SYMBOL_DETAILS_DURATION = 4 * 60 * 60`

To change cache duration, edit the constant in `symbolService.js`.

## Why This Happens

When you switch APIs or test with fallback prices (price=$1), those values get cached for 4 hours. The app won't fetch new prices until the cache expires, so you need to manually clear it to get fresh data from the new API.
