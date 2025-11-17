# 🐳 Docker PostgreSQL Setup (Easiest Method!)

Since you have Docker installed, this is the **simplest way** to get PostgreSQL running without installing it on your system.

## 📋 Quick Steps

### 1. Start Docker Desktop
- Open Docker Desktop from Start menu
- Wait until it's running (whale icon in system tray)

### 2. Run the Setup Scripts

Open Command Prompt in the `back/scripts` folder:

```cmd
cd C:\projects\imb\back\scripts
```

**Step 1 - Create PostgreSQL Container:**
```cmd
docker-setup.bat
```
This will:
- ✅ Create a PostgreSQL container
- ✅ Create the `rental_management` database
- ✅ Start PostgreSQL on port 5432

**Step 2 - Create Database Tables:**
```cmd
setup-database-docker.bat
```
This will:
- ✅ Create all tables and indexes
- ✅ Ask if you want sample data

### 3. Create .env File

```cmd
cd C:\projects\imb\back
copy env.example .env
```

The `.env` file is already configured correctly with:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rental_management
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Start Your Backend

```cmd
cd C:\projects\imb\back
npm install
npm run dev
```

## 🎮 Managing Your Database

**Stop PostgreSQL:**
```cmd
docker stop postgres-rental
```

**Start PostgreSQL:**
```cmd
docker start postgres-rental
```

**View database logs:**
```cmd
docker logs postgres-rental
```

**Connect to database (command line):**
```cmd
docker exec -it postgres-rental psql -U postgres -d rental_management
```

**Remove everything and start over:**
```cmd
docker stop postgres-rental
docker rm postgres-rental
```
Then run `docker-setup.bat` again.

## 🔍 Verify Database

Check if it's working:

```cmd
docker exec postgres-rental psql -U postgres -d rental_management -c "\dt"
```

You should see all your tables listed!

## ✅ Advantages of Docker

- ✅ No PostgreSQL installation needed on your Windows system
- ✅ Easy to start/stop
- ✅ Easy to reset if something goes wrong
- ✅ Same setup works on any computer with Docker
- ✅ Doesn't conflict with other databases

## 🆘 Troubleshooting

**"Docker is not running"**
- Start Docker Desktop and wait for it to fully load

**"Port 5432 is already in use"**
- Another PostgreSQL or app is using that port
- Stop it, or edit `docker-setup.bat` to use a different port (e.g., 5433)

**"Cannot connect to database"**
- Make sure container is running: `docker ps | findstr postgres-rental`
- Check logs: `docker logs postgres-rental`

## 🎉 That's It!

Your database is now running in Docker and ready to use!

