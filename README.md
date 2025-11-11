# TAP Agent Console - Hono + Playwright

Complete TypeScript console agent with Playwright browser automation and Hono server.

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Configure environment
cp .env.example .env
# Add your Ed25519 keys (Base58 format, 64-byte private, 32-byte public)

# Run
npm run dev
```

## API Endpoints

### Product Details
```bash
curl -X POST http://localhost:3000/api/product-details \
  -H "Content-Type: application/json" \
  -d '{"merchantUrl": "http://localhost:3001/product/1"}'
```

### Checkout
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productUrl": "http://localhost:3001/product/1",
    "cartUrl": "http://localhost:3001/cart",
    "checkoutUrl": "http://localhost:3001/checkout"
  }'
```

## Features

✅ Ed25519 Base58 signatures (RFC 9421)
✅ Playwright browser automation
✅ Product extraction
✅ Complete checkout flow
✅ Hono server
✅ TypeScript
✅ Console output

## Structure

- `src/index.ts` - Hono server and API routes
- `src/crypto.ts` - Ed25519 signature creation
- `src/playwright-agent.ts` - Browser automation
- `src/types.ts` - TypeScript types