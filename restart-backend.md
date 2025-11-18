# How to Restart the Backend

The backend needs to be restarted to load the new routes (public and opportunities).

## Option 1: Restart All Services

**Windows:**
1. Close all command windows running services
2. Run: `start-all.bat`

**Linux/Mac:**
```bash
./stop-all.sh
./start-all.sh
```

## Option 2: Restart Just the Backend

1. Find the backend command window and close it (or press Ctrl+C)
2. Open a new terminal/command window
3. Run:

**Windows:**
```bash
cd back
npm run dev
```

**Linux/Mac:**
```bash
cd back
npm run dev
```

## Verify It's Working

After restarting, test the endpoint:

**Windows PowerShell:**
```powershell
curl http://localhost:3001/api/public/properties
```

**Linux/Mac/Git Bash:**
```bash
curl http://localhost:3001/api/public/properties
```

You should see a JSON response with properties data (not a 404).

Then test from the public site:
- Go to: http://localhost:5174
- Properties should load!

