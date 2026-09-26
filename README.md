# DevilTrade

DevilTrade is a Vite + React + TypeScript paper-trading dashboard for studying NSE and BSE options. The current option chain and P&L are simulated and deliberately do not send orders to a broker.

## Local setup

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env` and set `VITE_DEMO_USER` and `VITE_DEMO_PASSWORD`.
3. Install dependencies and start the app:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with `npm run build` and preview it with `npm run preview`.

## Important limitations

Vite environment variables are bundled into browser code. The included login is only a local demo gate and is not suitable for protecting real accounts. Before using real credentials, add a server-side authentication service with hashed passwords, secure sessions, CSRF protection, rate limiting, and secrets stored only on the server.

The market rows are sample values styled like a live terminal. Real NSE/BSE option data requires a licensed provider and an authenticated server-side feed. Add that integration only after confirming the provider's API and redistribution terms.

## Hosting

This is ready for deployment to a static host such as Vercel, Netlify, or Cloudflare Pages after `npm run build`. Configure the two environment variables in the host's private project settings, but treat them as demo-only because Vite exposes `VITE_*` values to the browser.
