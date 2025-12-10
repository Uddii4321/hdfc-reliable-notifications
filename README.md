# HDFC Trusted Notifications (hdfc-reliable-notifications)

A demo project (backend + static frontend) showing a reliable notification routing engine. The Express backend serves APIs and the static frontend. The frontend lets you trigger notification events and inspect attempts, routing decisions and a secure inbox.

## Features
- Express backend with routing engine and helper APIs
- Static frontend (`frontend/index.html` + `frontend/app.js`) to send events and view results
- Local dev workflow using `nodemon` for auto-restarts
- Simple, self-contained demo useful for prototyping notification retry/routing behavior

## Tech stack
- Node.js (v18+/v20+) and npm
- Express.js
- Plain HTML/JS frontend (served statically)
- Dev tooling: `nodemon`

## Repository layout
- `backend/` — Express server, controllers, routes, services
  - `backend/server.js` — app entrypoint (serves APIs + static frontend)
  - `backend/package.json` — scripts & dependencies
- `frontend/` — static frontend application
  - `frontend/index.html`
  - `frontend/app.js`
- `data/` — sample data used by the demo
- `logs/` — (optional) inbox/logs used by the demo

## Quick start (Windows PowerShell)

### 1. Prerequisites
Install Node.js (LTS). Download the Windows MSI at https://nodejs.org/ and run it (ensure “Add to PATH” is checked). After install, restart PowerShell.

Verify:
```powershell
node -v
npm -v
npx -v
```

If `node`/`npm` are "not recognized", either reopen PowerShell or add `C:\Program Files\nodejs` to your PATH.

### 2. Install dependencies
From the project root:
```powershell
cd 'C:\Users\uddip\OneDrive\Desktop\ADTU\HDFC Training\HDFC Internship Project\HDFC Internship\backend'
npm install
```

### 3. Run the server (development)
This repo includes a `dev` script that runs `nodemon`:
```powershell
npm run dev
```
Or run without auto-reload:
```powershell
npm run start
# or
node server.js
```

When the server is running you should see:
```
Server listening on 5000
```

### 4. Open the frontend
Open your browser at:
```
http://localhost:5000/
```
The UI will call the backend APIs at:
- POST `/api/notifications/send` (trigger an event)
- GET `/api/helpers/inbox` (read the secure inbox)

## npm scripts
Check `backend/package.json` for scripts. Typical scripts included:
- `npm run start` — run with `node server.js`
- `npm run dev` — run with `nodemon server.js` (auto restart)

## API (used by the frontend)
- POST /api/notifications/send  
  Body: `{ "eventType": "<event name>" }`  
  Response: routing decision + ordered channels + attempts array + reason + event sample data
- GET /api/helpers/inbox  
  Returns JSON array of messages in the demo inbox.

(These are the endpoints the frontend uses. See `routes/notifications.js` and `routes/helpers.js` for implementation details.)

## Environment variables
This demo uses a simple default port. If you want to override:
- `PORT` — port for the server (default: `5000`)

Example:
```powershell
$env:PORT=4000
node server.js
```

## .gitignore recommendation
Make sure you do NOT commit `node_modules/` or any secrets. Example entries:
```
node_modules/
.env
npm-debug.log*
.vscode/
logs/
.DS_Store
```

## Troubleshooting

- "node / npm not recognized"
  - Reopen PowerShell after installing Node, or add `C:\Program Files\nodejs` to your user PATH.
  - For a current session: `$env:Path += ';C:\Program Files\nodejs'`
  - Allow npm scripts to run in PowerShell if you see "running scripts is disabled":
    ```powershell
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
    ```

- Port 5000 already in use:
  - Kill the process using that port or set `PORT` to a different value:
    ```powershell
    netstat -ano | Select-String ":5000"
    Stop-Process -Id <PID>
    ```

- `npx` or `nodemon` problems:
  - `nodemon` is in `devDependencies`. Use `npm run dev` which uses the local `node_modules/.bin/nodemon`.
  - Or install nodemon globally: `npm install -g nodemon` (not required).

- Browser CORS errors:
  - The backend enables CORS by default in this demo. If you change host/port, ensure CORS is configured in `backend/server.js`.

## Development notes & suggestions
- Keep the repo out of synchronized folders like OneDrive if you experience file-locks or syncing conflicts. Consider moving to `C:\Projects\hdfc-reliable-notifications`.
- Add a `README.md` (this file) and a short contributing section if you plan to share the code.
- Add tests or a CI workflow if you intend to maintain this repository long-term.

## Contribution
If you want me to:
- Create the `README.md` file in your workspace now, say "Create README".  
- I can also add a `.gitignore`, finalize the initial commit, and provide exact `git` commands to push to GitHub.

## License
Add an appropriate license (e.g., MIT). Example:
```
MIT License
```
(Replace with your preferred license.)

---

If you want, I can now commit these files and push them to your `origin` remote. Say "Commit and push" and I'll run the git commands.
