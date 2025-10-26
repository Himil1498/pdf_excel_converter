# Complete Setup Guide

## Step-by-Step Installation

### Step 1: Install Prerequisites

#### 1.1 Install Node.js
- Download from: https://nodejs.org/
- Version required: 18.x or higher
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

#### 1.2 Install MySQL
- Download from: https://dev.mysql.com/downloads/mysql/
- Version required: 8.0 or higher
- During installation:
  - Set root password (remember this!)
  - Use default port 3306
  - Enable MySQL as a service

- Verify installation:
  ```bash
  mysql --version
  ```

### Step 2: Database Setup

#### 2.1 Create Database

Open MySQL command line:
```bash
mysql -u root -p
# Enter your MySQL root password
```

The database will be created automatically when you run the init script, or you can create it manually:

```sql
CREATE DATABASE pdf_excel_converter;
USE pdf_excel_converter;
```

Exit MySQL:
```sql
exit;
```

#### 2.2 Configure Backend Environment

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux use: `cp .env.example .env`)

3. Edit `.env` file with your settings:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
   DB_NAME=pdf_excel_converter

   # File Upload Configuration
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   MAX_FILES_PER_BATCH=1000

   # OpenAI Configuration (OPTIONAL - for AI extraction)
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4-turbo-preview

   # Processing Configuration
   BATCH_PROCESSING_DELAY=100
   MAX_CONCURRENT_PROCESSES=5

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### Step 3: Backend Installation

```bash
# Make sure you're in the backend directory
cd backend

# Install dependencies
npm install

# Initialize the database
npm run init-db

# You should see:
# ✓ Connected to MySQL server
# ✓ Schema file loaded
# ✓ Database schema created successfully
```

### Step 4: Frontend Installation

Open a NEW terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Step 5: Running the Application

#### 5.1 Start Backend (Terminal 1)

```bash
cd backend
npm run dev

# You should see:
# ========================================
#   PDF to Excel Converter API
# ========================================
#   Environment: development
#   Server running on: http://localhost:5000
#   Database: pdf_excel_converter
# ========================================
```

#### 5.2 Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev

# You should see:
#   VITE v5.x.x  ready in xxx ms
#   ➜  Local:   http://localhost:3000/
```

### Step 6: Test the Application

1. Open browser and go to: `http://localhost:3000`
2. You should see the PDF to Excel Converter interface
3. Try uploading the sample PDF included in the project

### Step 7: Optional - OpenAI Setup (For AI Extraction)

If you want to use AI-powered extraction:

1. Get an OpenAI API key:
   - Go to: https://platform.openai.com/api-keys
   - Create an account or login
   - Generate a new API key
   - Copy the key

2. Add to backend `.env`:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Restart backend server

**Note**: AI extraction is optional. The app works with regex-based extraction without an API key.

## Common Issues and Solutions

### Issue 1: Database Connection Failed

**Error**: `ER_ACCESS_DENIED_ERROR` or `ECONNREFUSED`

**Solutions**:
1. Check MySQL is running:
   - Windows: Open Services, look for MySQL80, ensure it's running
   - Mac: `brew services list` or System Preferences
   - Linux: `sudo systemctl status mysql`

2. Verify credentials in `.env`:
   - DB_USER should be `root` (or your MySQL user)
   - DB_PASSWORD should match your MySQL password
   - DB_HOST should be `localhost`

3. Test MySQL connection:
   ```bash
   mysql -u root -p
   # Enter password
   # If this fails, MySQL credentials are wrong
   ```

### Issue 2: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
1. Change port in backend `.env`:
   ```env
   PORT=5001
   ```

2. Or kill the process using port 5000:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -ti:5000 | xargs kill -9`

### Issue 3: Module Not Found

**Error**: `Cannot find module 'express'` or similar

**Solution**:
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

# Same for frontend if needed
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Upload Folder Permission Error

**Error**: `EACCES: permission denied, mkdir`

**Solution**:
1. Create uploads folder manually:
   ```bash
   mkdir uploads
   mkdir uploads/pdfs
   mkdir uploads/exports
   ```

2. On Mac/Linux, set permissions:
   ```bash
   chmod -R 755 uploads
   ```

### Issue 5: PDF Parsing Fails

**Error**: Processing stuck or files fail

**Solutions**:
1. Check PDF file is not corrupted
2. Ensure PDF is text-based (not scanned image)
3. Check backend logs for specific errors
4. Try with AI extraction enabled
5. Reduce concurrent processes in `.env`:
   ```env
   MAX_CONCURRENT_PROCESSES=2
   ```

## Verifying Installation

Run this checklist:

- [ ] MySQL server is running
- [ ] Database `pdf_excel_converter` exists
- [ ] Backend server starts without errors (port 5000)
- [ ] Frontend dev server starts (port 3000)
- [ ] Can access `http://localhost:3000` in browser
- [ ] Can see API response at `http://localhost:5000/api/health`
- [ ] Upload folder exists and has write permissions

## Testing with Sample PDF

1. Use the included PDF: `48250353-20250901,,.pdf`
2. Go to Upload page
3. Enter batch name: "Test Batch"
4. Enable AI extraction (if you have API key) or disable it
5. Upload the PDF
6. Go to Batches page
7. Click on the batch to see processing status
8. Once complete, download the Excel file
9. Open Excel and verify data extraction

## Production Deployment

For production deployment:

1. Set environment to production:
   ```env
   NODE_ENV=production
   ```

2. Use process manager (PM2):
   ```bash
   npm install -g pm2
   cd backend
   pm2 start server.js --name pdf-converter-api
   ```

3. Build frontend:
   ```bash
   cd frontend
   npm run build
   # Serve the dist folder with nginx or similar
   ```

4. Use environment variables for secrets
5. Enable HTTPS
6. Set up database backups
7. Configure proper CORS origins
8. Implement rate limiting
9. Set up monitoring and logging

## Getting Help

If you encounter issues not covered here:

1. Check the logs:
   - Backend: Console output shows detailed errors
   - Frontend: Browser console (F12)
   - MySQL: Check MySQL error log

2. Common log locations:
   - Windows: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\`
   - Mac: `/usr/local/mysql/data/`
   - Linux: `/var/log/mysql/`

3. Enable debug mode:
   ```env
   NODE_ENV=development
   ```

4. Test individual components:
   - Test database: `mysql -u root -p`
   - Test backend: `curl http://localhost:5000/api/health`
   - Test frontend: Open browser dev tools

---

**Setup should take 15-30 minutes for first-time installation**
