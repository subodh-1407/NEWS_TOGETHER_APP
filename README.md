# NewTogether

A React and Express news reader with light Midnight & Amber styling, dark Slate & Lavender styling, multilingual article browsing, and account bookmarks. Login and signup use Slate & Lavender in either mode.

## Run locally

1. Install packages in the root, client, and server directories with npm install.
2. Copy server/.env.example to server/.env only if you do not already have local settings. Configure MONGODB_URI, JWT_SECRET, and NEWS_API_KEY.
3. Optionally copy client/.env.example to client/.env for a custom backend address.
4. Run npm start from the repository root. The client uses port 3000; the server defaults to 4000.

On Windows PowerShell use npm.cmd if the execution policy blocks npm.ps1.

## Production

Frontend: https://news-together-app.vercel.app

Backend: https://news-together-app.onrender.com

- Vercel root directory: client. Build command: npm run build. Output: build.
- Render root directory: server. Start command: npm start.
- REACT_APP_API_URL is a frontend build variable. Set it to the backend origin (for example https://news-together-app.onrender.com), without /api/v1. News fetching retains the original production Render proxy calls and defaults to Render even during local development. Login, signup, and bookmarks use the shared normalized base and default to localhost:4000 during development.
- Render requires MONGODB_URI, JWT_SECRET, and NEWS_API_KEY. Set NODE_ENV=production. FRONTEND_URL may specify the public frontend origin; the current Vercel origin is allowed by default. CORS_ORIGIN and CLIENT_ORIGIN are accepted as legacy aliases.
- A frontend environment change requires a new Vercel build. A backend environment or controller change requires a Render deployment/restart.
- Pushing main triggers deployment only when the hosting service has Git auto-deploy enabled for that branch. Check Vercel and Render independently.

The news key belongs only on the backend. A NewsAPI subscription suitable for production is required under the provider's terms. Theme changes introduce no additional backend secrets.

## Checks

Run npm test for bookmark, HTTP/CORS, login, navigation, and API configuration regressions. Run npm run build for the production frontend. Tests use model/provider mocks; they do not modify the production database.

## Credentials

Local .env files must not be committed. This repository historically tracked server/.env; removal from the latest tree does not remove past copies from Git history. Rotate any previously committed credentials through the hosting/provider dashboards.
