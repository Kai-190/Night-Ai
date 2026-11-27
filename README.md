# NIGHT AI — Business Workspace

A responsive React + Vite frontend starter for an AI-powered business management dashboard.

## Run locally

Install Node.js (LTS), then run these commands in this folder:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

### Configure NIGHT AI chat

The chat uses the OpenAI Chat Completions API from a server-side endpoint. Copy `.env.example` to `.env.local` and add your API key:

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
```

Restart the dev server after changing environment variables. The Vite development server exposes the same `/api/chat` endpoint used by the Vercel deployment. In Vercel, add `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) under **Project Settings → Environment Variables**, then redeploy. The API key must only be configured as a server environment variable; do not use a `VITE_` prefix or put it in frontend code.

The API sends the recent conversation to the configured provider. Avoid including passwords, payment details, or other sensitive personal information in chat.

## GCash payments with Laravel and PayMongo

The website's **Payments → Pay with GCash** form starts a PayMongo Checkout Session through a Laravel API. The Laravel integration files are in [`laravel/`](./laravel/); this folder contains integration code, not a complete Laravel installation. PHP and Composer must be installed before running that backend.

### Set up the Laravel API

1. Create a separate Laravel app alongside this Vite project and enable API routes:

   ```bash
   composer create-project laravel/laravel laravel-app
   cd laravel-app
   php artisan install:api
   ```

2. Copy the files under this project's `laravel/` folder into the matching locations in `laravel-app/`. Replace `routes/api.php` and `config/cors.php`; copy the payment model, controllers, migration, and `config/paymongo.php`.
3. Configure the Laravel `.env` with PayMongo **test** credentials and your frontend URL:

   ```env
   APP_ENV=local
   APP_URL=http://127.0.0.1:8000
   FRONTEND_URL=http://127.0.0.1:5173
   PAYMONGO_MODE=test
   PAYMONGO_SECRET_KEY=your-paymongo-test-secret-key
   PAYMONGO_WEBHOOK_SECRET=your-paymongo-test-webhook-secret
   ```

   Keep both PayMongo secrets in Laravel only. Never put them in the Vite `.env` or browser code.
4. Configure Laravel's database, then run `php artisan migrate` and start it with `php artisan serve --host 127.0.0.1 --port 8000`.
5. In this project's `.env.local`, set `VITE_API_URL=http://127.0.0.1:8000`, restart Vite, and use **Payments → Pay with GCash**. Use PayMongo's test credentials and test checkout first.
6. In PayMongo, register `https://YOUR-LARAVEL-HOST/api/webhooks/paymongo` as a webhook endpoint for checkout-session paid and failed events. Configure its signing secret as `PAYMONGO_WEBHOOK_SECRET`. Set `PAYMONGO_MODE=live` only when using live credentials and the live webhook secret.

On deployment, host Laravel separately from this Vite/Vercel frontend. Set the Vercel environment variable `VITE_API_URL` to the public Laravel API origin, and set Laravel's `FRONTEND_URL` to the deployed website origin. Update the CORS allow-origin accordingly. Complete PayMongo merchant onboarding and verify its current GCash and payout requirements before accepting live payments.

**Important:** this starter form accepts an amount from the browser and is only suitable for a test/demo checkout. For real sales, derive the amount from a server-side product/order record instead of trusting a customer-editable amount. The current dashboard also has no customer authentication or saved transaction reporting. Never treat a browser redirect as proof of payment; the Laravel webhook marks a transaction paid only after signature verification.

## Production build

```bash
npm run build
npm run preview
```

Vite writes the production website to `dist/`.

## Deploy with Cloudflare Pages

This repository includes a Cloudflare Pages Functions chat endpoint at `functions/api/chat.js`.

1. In Cloudflare Pages, create a project and connect this GitHub repository.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` as Pages environment variables.
4. Deploy, then add the deployed domain to Laravel's `FRONTEND_URL` if GCash payments are enabled.

For Vercel, `api/chat.js` provides the serverless chat endpoint. For Cloudflare Pages, `functions/api/chat.js` provides it instead. Deploy only one frontend host at a time and keep provider secrets in that host's server environment.

## Deploy with GitHub + Vercel

1. Create a GitHub repository for this project.
2. Upload the **contents** of this folder to the repository root (so `package.json` and `index.html` are at the top level). Do not upload `node_modules` or `dist`.
3. Sign in to Vercel and choose **Add New → Project**.
4. Import the GitHub repository and authorize Vercel to access it.
5. Keep the detected framework as **Vite**. Use these settings if Vercel asks:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `./`
6. Select **Deploy**. Vercel will build and publish the site. Future pushes to the connected GitHub branch will trigger new deployments.

No GitHub Pages workflow is needed for Vercel. The old `deploy.yml` was intentionally left out because it deploys to GitHub Pages, not Vercel.

## Current app limitations

This is a frontend demo, not yet a production business platform:

- No login or user authentication is connected.
- No database is connected; tasks and chat are held in browser memory.
- NIGHT AI can call the configured OpenAI model; chat history is held in browser memory and is not saved to a database.
- PayMongo GCash checkout requires the separate Laravel API, merchant credentials, database migrations, and webhook setup described above.
- Dashboard figures are placeholders, not real business data.

Do not enter real customer personal information or payment details in this demo. For a real service, add a secure backend, database, authentication, privacy/security controls, and a payment provider with server-side verification. Keep all secret API keys on the server, never in browser code. An eligible adult/guardian should handle merchant onboarding and accounts that require an adult.
