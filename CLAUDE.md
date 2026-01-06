# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start development server with Node inspector
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run analyze      # Build with bundle analyzer enabled
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth v4 with Google OAuth and Email providers
- **Database**: MongoDB with Mongoose ODM
- **Payments**: Stripe (Checkout and Customer Portal)
- **Email**: Resend for transactional emails
- **UI**: Tailwind CSS with DaisyUI components
- **Charts**: amCharts 5
- **State Management**: Zustand stores
- **Caching**: Redis (ioredis)
- **API Data**: Yahoo Finance 2 for stock/ETF data

## Architecture

### Core Concepts

**FortuneOK** is an investment portfolio tracker that manages multi-currency assets across different categories (stocks, ETFs, crypto, real estate, cash, etc.). The app calculates allocation percentages, handles currency conversions, and provides visual insights into portfolio composition.

### Key Architectural Patterns

#### 1. Asset Management Flow
- Assets are stored in MongoDB with `userId`, `category`, `currentValuation`, and optional `symbol`/`shares` for tradeable assets
- Trading categories (stocks, ETFs, bonds, crypto, options, futures) require `symbol` and `shares`; prices are fetched from Yahoo Finance
- Non-trading categories (cash, real estate, cars, precious metals) use manual `currentValuation` input
- All monetary values use `{currency: String, amount: Number}` structure to support multi-currency tracking

#### 2. Currency Conversion System
- Base currency (USD default) is user-configurable via `PreferencesContext`
- Exchange rates fetched from `@fawazahmed0/currency-api` and cached in Redis (1 hour TTL)
- Conversion happens client-side in `assetService.js` via `convertFromBaseCurrency()` function
- Each asset stores original currency; conversions are calculated dynamically for display

#### 3. Asset Categories & Hierarchy
- Defined in `services/assetService.js` as `ASSET_CATEGORIES_STRUCTURE`
- Parent categories can have subcategories (e.g., "Cash" contains "Savings account", "Checking account", "P2P loans")
- Category groups used for aggregation in charts and summary cards
- Icons assigned per category group for consistent UI representation

#### 4. State Management Strategy
- **Zustand stores**:
  - `assetStore.js`: Manages asset CRUD operations, selected IDs, stock data cache
  - `currencyRatesStore.js`: Handles exchange rate fetching and caching
- **React Context**:
  - `PreferencesContext.js`: User preferences (currency, theme)
  - `ThemeContext.js`: Dark/light mode management
- Server state (assets, user data) fetched on mount and kept in Zustand; no React Query

#### 5. Error Logging System
- Client-side error logger in `libs/errorLogger.js` captures errors and sends to `/api/logs`
- `Log` model stores errors with userId, action type, stack trace, request details
- Global handlers initialized in app layout for unhandled errors/rejections
- Deduplication prevents duplicate error logs within 2-second window
- **Only logs in production** to avoid noise during development

#### 6. Authentication & Access Control
- NextAuth handles Google OAuth and email magic links
- User model includes `hasAccess` (subscription status), `customerId`, `priceId` (Stripe)
- Stripe webhooks update `hasAccess` when payment succeeds/fails
- `lastAccessAt` tracks user engagement; updated on every sign-in

#### 7. API Route Patterns
All API routes follow this structure:
```javascript
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongoose from "@/libs/mongoose";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongoose();
  // ... operation logic

  return NextResponse.json({ data });
}
```

Always call `connectMongoose()` before database operations. Validate inputs and return appropriate status codes.

### File Organization

- **`/app`**: Next.js App Router pages and API routes
  - `/app/api/*`: API endpoints for assets, logs, users, Stripe webhooks, symbols
  - `/app/dashboard`: Main authenticated app view
  - `/app/demo`: Demo mode (no authentication)
- **`/components`**: React components (all client components use `"use client"` directive)
- **`/libs`**: Utilities (auth, Stripe, MongoDB, Redis, API client, error logger)
- **`/models`**: Mongoose schemas (User, Asset, Log, Lead)
- **`/services`**: Business logic (asset calculations, currency conversions, date formatting, chart data)
- **`/store`**: Zustand state stores
- **`/contexts`**: React contexts for global state

### Important Business Rules

#### Asset Validation
- Trading categories require: `date`, `category`, `brokerName`, `symbol`, `shares`
- Non-trading categories require: `date`, `category`, `description`, `currentValuation.currency`, `currentValuation.amount`
- Validation logic in `services/assetService.js` `validateAssetData()`

#### Financial Calculations
- **Always use Decimal.js or careful float handling** for currency math (see `.cursorrules`)
- Allocation % = (Asset Value / Total Portfolio Value) × 100
- Assets grouped by category group (not individual category) for allocation charts
- Multi-currency portfolios: convert all to base currency before summing

#### Symbol Search & Pricing
- `/api/symbols/search` proxies Yahoo Finance search
- `/api/symbols/search/direct` provides direct Yahoo Finance API access
- Stock prices cached in `assetStore` to minimize API calls
- Currency and price extracted from Yahoo Finance response

## Configuration

All app settings centralized in `config.js`:
- `appName`, `appDescription`, `domainName`
- `stripe.plans`: Stripe pricing plans with `priceId`, `name`, `price`, `features`
- `resend`: Email sender addresses
- `auth.loginUrl`, `auth.callbackUrl`: Auth flow URLs

## Environment Variables

Required:
```
NEXTAUTH_SECRET
NEXTAUTH_URL
MONGODB_URI
STRIPE_PUBLIC_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
GOOGLE_ID (optional - for Google OAuth)
GOOGLE_SECRET (optional - for Google OAuth)
RESEND_API_KEY
```

## Development Guidelines

### Code Style
- **Components**: PascalCase (e.g., `ButtonCheckout.js`)
- **API Routes**: kebab-case directories with `route.js`
- **Utilities**: camelCase functions
- Use absolute imports with `@/` prefix
- Client components must have `"use client"` directive at top

### DaisyUI & Tailwind
- Use DaisyUI components (buttons, modals, dropdowns) where possible
- Avoid inline styles; use Tailwind utility classes
- Responsive breakpoints handled via Tailwind's `sm:`, `md:`, `lg:`, `xl:`
- Theme configured via `config.colors.theme` (supports light/dark/system)

### Database & Mongoose
- Always call `connectMongoose()` before DB operations
- Use the `toJSON` plugin on all schemas for clean API responses
- Add indexes on frequently queried fields (see `Log` model for example)
- Timestamps automatically added via `{ timestamps: true }`

### Stripe Integration
- Use `createCheckout()` from `@/libs/stripe` to create sessions
- Webhooks in `/app/api/webhook/stripe/route.js` handle payment events
- Store `customerId` and `priceId` in User model
- `hasAccess` field controls feature access

### Performance Considerations
- Heavy components (charts, modals) use `dynamic()` imports with `ssr: false`
- Currency rates cached in Redis (1 hour)
- Stock data cached in Zustand store to reduce Yahoo Finance API calls
- Avoid refetching assets unnecessarily; use Zustand's cached state

### Security Notes
- Validate all inputs in API routes
- Never commit `.env.local`
- Sanitize user inputs before DB operations
- Use session checks for all authenticated routes

## Common Patterns

### Adding a New Asset Category
1. Update `ASSET_CATEGORIES_STRUCTURE` in `services/assetService.js`
2. Add icon and label
3. Determine if it's a trading category (add to `TRADING_CATEGORIES` if yes)
4. Update validation logic in `validateAssetData()` if needed

### Creating a New API Endpoint
1. Create `/app/api/[endpoint]/route.js`
2. Import `getServerSession`, `authOptions`, `connectMongoose`
3. Check session if authentication required
4. Call `connectMongoose()` before DB operations
5. Return `NextResponse.json()` with appropriate status codes

### Working with Currency Conversions
- Use `convertFromBaseCurrency(currency, amount, rates)` from `assetService.js`
- Rates fetched via `getConversionRates(baseCurrency)` from `conversionRatesService.js`
- Always convert to base currency before aggregating values
- Store original currency in asset; never overwrite

### Error Handling Best Practices
- Wrap async operations in try-catch
- Use `logError()` from `libs/errorLogger.js` for client-side errors
- API routes: return `{ error: "message" }` with proper status code
- Console.error for server-side errors
