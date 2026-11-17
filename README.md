# NewTogether

A React and Express news reader with light Midnight & Amber styling, dark Slate & Lavender styling, multilingual article browsing, and account bookmarks. Login and signup use Slate & Lavender in either mode.

## Run locally

1. Install packages in the root, client, and server directories with npm install.
2. Copy server/.env.example to server/.env only if you do not already have local settings. Configure MONGODB_URI and JWT_SECRET. For the local NewsData.io provider, set NEWS_PROVIDER=newsdata and NEWSDATA_API_KEY to your own key.
3. Optionally copy client/.env.example to client/.env for a custom backend address.
4. Run npm start from the repository root. The client uses port 3000; the server defaults to 4000.

On Windows PowerShell use npm.cmd if the execution policy blocks npm.ps1.

## Production

Frontend: https://news-together-app.vercel.app

Backend: https://news-together-app.onrender.com

- Vercel root directory: client. Build command: npm run build. Output: build.
- Render root directory: server. Start command: npm start.
- REACT_APP_API_URL is a frontend build variable. All app requests use the normalized API base. Development defaults to localhost:4000; production defaults to the Render backend above.
- The backend requires MONGODB_URI and JWT_SECRET. NewsData.io is selected with NEWS_PROVIDER=newsdata and requires NEWSDATA_API_KEY; legacy NewsAPI remains available with NEWS_PROVIDER=newsapi and NEWS_API_KEY. Set NODE_ENV=production. FRONTEND_URL may specify the public frontend origin; the current Vercel origin is allowed by default. CORS_ORIGIN and CLIENT_ORIGIN are accepted as legacy aliases.
- A frontend environment change requires a new Vercel build. A backend environment or controller change requires a Render deployment/restart.
- Pushing main triggers deployment only when the hosting service has Git auto-deploy enabled for that branch. Check Vercel and Render independently.

Provider keys belong only on the backend. The local NewsData.io integration normalizes articles into the existing UI shape, retains cursor pages for Previous/Next navigation, and caches responses for five minutes. It allows up to 20 pages per query and 1-10 articles per page. Check your provider plan before deploying. These local changes are not deployed automatically until committed and pushed.

## Checks

Run npm test for bookmark, HTTP/CORS, login, navigation, and API configuration regressions. Run npm run build for the production frontend. Tests use model/provider mocks; they do not modify the production database.

## Credentials

Local .env files must not be committed. This repository historically tracked server/.env; removal from the latest tree does not remove past copies from Git history. Rotate any previously committed credentials through the hosting/provider dashboards.

## Mobile support

Navigation collapses below 1024px into a keyboard-accessible menu. Article sections, categories, language buttons, hero controls, and footer columns wrap on smaller screens. Login/signup stack below 640px while preserving the existing desktop animation and the selected colours.
