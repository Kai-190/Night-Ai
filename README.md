# NIGHT AI — Business Workspace

A responsive React + Vite frontend starter for an AI-powered business management dashboard.

## Run locally

Install Node.js (LTS), then run these commands in this folder:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

Vite writes the production website to `dist/`.

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
- NIGHT AI uses demo replies and does not call a live AI model.
- GCash/payment processing is not enabled; the dashboard does not collect or verify money.
- Dashboard figures are placeholders, not real business data.

Do not enter real customer personal information or payment details in this demo. For a real service, add a secure backend, database, authentication, privacy/security controls, and a payment provider with server-side verification. Keep all secret API keys on the server, never in browser code. An eligible adult/guardian should handle merchant onboarding and accounts that require an adult.
