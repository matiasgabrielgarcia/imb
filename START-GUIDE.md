# Quick Start Guide - Running All Services

## 🚀 **Recommended: Just run this in Cursor's terminal**

```bash
./start-all.sh
```

The script is **smart** and automatically detects your environment:

### ✅ **In Cursor/VS Code terminal** (What you're using now)
- Runs all 3 services in the **background**
- Logs output to: `back.log`, `front.log`, `wapp.log`
- You can **keep working** in the same terminal
- View logs with: `tail -f back.log`
- Stop with: `./stop-all.sh`

### ✅ **In standalone Git Bash**
- Opens 3 **separate PowerShell windows**
- Each service in its own window
- Easy to monitor individually

### ✅ **In WSL/Linux**
- Runs in background with log files
- Standard Unix behavior

---

## 📋 **First Time Setup**

```bash
# Make scripts executable
chmod +x start-all.sh stop-all.sh

# Make sure dependencies are installed
cd back && npm install && cd ..
cd front && npm install && cd ..
cd wapp && npm install && cd ..
```

---

## 🔍 **View Logs**

```bash
# View all logs together
tail -f back.log front.log wapp.log

# Or individually
tail -f back.log    # Backend only
tail -f front.log   # Frontend only
tail -f wapp.log    # WhatsApp only
```

---

## 🛑 **Stop All Services**

```bash
./stop-all.sh
```

---

## 🌐 **Service URLs**

After starting, access:
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:5173
- **WhatsApp:** http://localhost:3002

---

## 🔧 **Other Options**

If you prefer a different method, see `START_SERVICES.md` for:
- PowerShell scripts
- Batch files
- NPM with concurrently
- One-liners

---

## ❓ **Troubleshooting**

### **Services won't start?**
Check if ports are already in use:
```bash
# Windows
netstat -ano | findstr "3000 5173 3002"

# Linux/WSL
lsof -i :3000,5173,3002
```

### **Can't see output?**
Check the log files:
```bash
cat back.log
cat front.log
cat wapp.log
```

### **Want to force inline mode?**
```bash
./start-all.sh --inline
```

