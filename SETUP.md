# Quick Setup Guide

## Prerequisites Check

Before starting, verify you have:
- [ ] Node.js 16+ (`node --version`)
- [ ] MySQL 8.0+ (`mysql --version`)
- [ ] npm (`npm --version`)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MySQL Database

**Option A: Command Line**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE bug_tracker;
exit;
```

**Option B: MySQL Workbench**
- Open MySQL Workbench
- Connect to your server
- Run: `CREATE DATABASE bug_tracker;`

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your settings:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=bug_tracker
JWT_SECRET=some_random_secret_key_here
```

**Generate a secure JWT secret:**
```bash
# On Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# On Linux/Mac
openssl rand -base64 32
```

### 4. Run Database Migrations

```bash
npm run db:migrate
```

You should see:
```
✓ Database connected successfully
✓ Migration completed successfully
```

### 5. Seed Sample Data

```bash
npm run db:seed
```

This creates:
- 4 sample users (admin, 2 developers, 1 reporter)
- 5 sample bugs
- 3 sample comments

**Default Login Credentials:**
- Admin: `admin@bugtracker.com` / `password123`
- Developer: `john@bugtracker.com` / `password123`
- Developer: `jane@bugtracker.com` / `password123`
- Reporter: `bob@bugtracker.com` / `password123`

### 6. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✓ Database connected successfully
✓ Server running on http://localhost:3000
```

### 7. Test the API

**Option A: Browser**
Visit: http://localhost:3000/health

**Option B: cURL**
```bash
curl http://localhost:3000/health
```

**Option C: Postman**
Import `Bug-Tracker.postman_collection.json`

## Quick Test Workflow

1. **Login as admin:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@bugtracker.com\",\"password\":\"password123\"}"
```

Copy the token from the response.

2. **Create a bug:**
```bash
curl -X POST http://localhost:3000/api/bugs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"title\":\"Test Bug\",\"description\":\"This is a test bug for practice\",\"priority\":\"high\",\"severity\":\"major\"}"
```

3. **Get all bugs:**
```bash
curl http://localhost:3000/api/bugs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch
```

## Common Issues

### "Cannot connect to database"
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### "Module not found"
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### "Port 3000 already in use"
Change `PORT=3000` to `PORT=3001` in `.env`

### Email not sending
- Email is optional for basic functionality
- To enable: Use Gmail App Password or SMTP service
- Leave email config empty to skip (emails will log to console)

## What's Next?

1. ✅ Explore the API endpoints in Postman
2. ✅ Review the code structure in `/src`
3. ✅ Run the tests to see coverage
4. ✅ Try modifying a controller or adding a new endpoint
5. ✅ Read the main README.md for detailed documentation

## Need Help?

- Check `README.md` for full documentation
- Review code comments in `/src` files
- Look at test files in `/tests` for examples

Good luck with your interview! 🚀
