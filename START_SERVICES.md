# Start All Services

This project has **5 options** to run `/back`, `/front`, and `/wapp` simultaneously:

---

## ✅ **Option 1: Bash Script** (Git Bash / WSL / Linux)

Universal shell script that works across platforms.

```bash
./start-all.sh
```

**First time setup (make it executable):**
```bash
chmod +x start-all.sh stop-all.sh
```

**To stop all services (WSL/Linux):**
```bash
./stop-all.sh
```

**Features:**
- ✅ Works on Git Bash, WSL, and Linux
- ✅ On Windows/Git Bash: Opens separate PowerShell windows
- ✅ On WSL/Linux: Runs in background with log files
- ✅ Color-coded output
- ✅ Includes stop script for easy cleanup

---

## ✅ **Option 2: PowerShell Script** (Native Windows)

Opens each service in its own PowerShell window with color-coded output.

```powershell
.\start-all.ps1
```

**Features:**
- ✅ Each service in separate window
- ✅ Color-coded for easy identification
- ✅ Easy to close individual services
- ✅ Shows service URLs

---

## ✅ **Option 3: Batch Script** (Classic Windows)

Opens each service in its own CMD window.

```cmd
start-all.bat
```

**Features:**
- ✅ Simple and reliable
- ✅ Each service in separate window
- ✅ Works on any Windows version
- ✅ Named windows for easy identification

---

## ✅ **Option 4: NPM with concurrently** (All in one terminal)

Runs all services in a single terminal with prefixed output.

**First time setup:**
```powershell
npm install
```

**Then run:**
```powershell
npm run dev
```

**OR if you want all services to stop if one fails:**
```powershell
npm run dev:kill-on-error
```

**Features:**
- ✅ Cross-platform (works on Windows, Mac, Linux)
- ✅ All output in one terminal
- ✅ Color-coded prefixes
- ✅ Easy to stop all services with Ctrl+C

---

## ✅ **Option 5: Manual One-Liners**

### Bash (Git Bash / WSL / Linux):
```bash
(cd back && npm run dev) & (cd front && npm run dev) & (cd wapp && npm run dev) &
```

### PowerShell:
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd back; npm run dev"; Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd front; npm run dev"; Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd wapp; npm run dev"
```

### CMD:
```cmd
start cmd /k "cd back && npm run dev" && start cmd /k "cd front && npm run dev" && start cmd /k "cd wapp && npm run dev"
```

---

## 🔗 Service URLs

After starting, the services will be available at:

- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:5173 (Vite dev server)
- **WhatsApp Service:** http://localhost:3002

---

## 🛑 Stopping Services

### For Option 1 (Bash Script):
- **On Git Bash/Windows:** Close each PowerShell window individually
- **On WSL/Linux:** Run `./stop-all.sh` to stop all background services

### For Options 2, 3, or 5:
- Close each window individually, or
- Press `Ctrl+C` in each window

### For Option 4 (concurrently):
- Press `Ctrl+C` once in the terminal (stops all services)

---

## 📝 Notes

- Make sure you have `node_modules` installed in each directory first:
  ```bash
  cd back && npm install && cd ..
  cd front && npm install && cd ..
  cd wapp && npm install && cd ..
  ```

- For **Option 1** (Bash), make scripts executable:
  ```bash
  chmod +x start-all.sh stop-all.sh
  ```

- For **Option 4** (concurrently), install the root dependencies:
  ```bash
  npm install
  ```

---

## 🎯 Recommendation

- **For Git Bash / WSL / Linux:** Use **Option 1** (Bash script) - universal, works everywhere
- **For daily development on Windows:** Use **Option 2** (PowerShell script) - clean, organized, separate windows
- **For quick testing:** Use **Option 3** (Batch script) - simple double-click
- **For CI/CD or all-in-one view:** Use **Option 4** (concurrently) - single terminal, easy logs
- **For quick command-line:** Use **Option 5** (one-liner) - no extra files needed

