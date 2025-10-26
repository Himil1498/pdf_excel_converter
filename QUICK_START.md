# Quick Start Guide - PDF to Excel Converter

## 🚀 Fastest Way to Get Started

### Option 1: One-Click Start (Windows)

1. Double-click **`START.bat`**
2. Edit `.env` file when prompted (add your MySQL password)
3. Wait for servers to start
4. Browser will open automatically at `http://localhost:3000`

**Done!** Start uploading PDFs.

---

### Option 2: Manual Start

#### Step 1: Setup (First Time Only)

```bash
# 1. Create MySQL database (if not exists)
mysql -u root -p
# Run: CREATE DATABASE pdf_excel_converter;
# Exit: exit;

# 2. Configure backend
cd backend
copy .env.example .env
# Edit .env with your MySQL password

# 3. Install dependencies
npm install
cd ../frontend
npm install

# 4. Initialize database
cd ../backend
npm run init-db
```

#### Step 2: Run Application

**Terminal 1** (Backend):
```bash
cd backend
npm run dev
```

**Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

**Terminal 3** (Open Browser):
```bash
# Open http://localhost:3000
```

---

## 📋 Basic Usage

### 1. Upload PDFs
- Go to **Upload** page
- Enter batch name
- Drag & drop PDFs (or click to select)
- Click "Upload and Process"

### 2. Monitor Progress
- Go to **Batches** page
- Click on your batch
- Watch real-time progress

### 3. Download Excel
- When complete, click "Download Excel"
- Open and verify extracted data

---

## ⚙️ Configuration

### Required: MySQL Password
Edit `backend/.env`:
```env
DB_PASSWORD=your_mysql_password_here
```

### Optional: AI Extraction
Add to `backend/.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

---

## 🔧 Troubleshooting

### Backend won't start?
```bash
# Check MySQL is running
mysql -u root -p

# Check .env file exists
ls backend/.env

# Check port 5000 is free
netstat -ano | findstr :5000
```

### Frontend won't load?
```bash
# Check backend is running first
curl http://localhost:5000/api/health

# Check no errors in frontend terminal
```

### Processing fails?
- Check PDF is valid (not corrupted)
- Check PDF contains text (not scanned image)
- Try with AI disabled first
- Check backend logs for errors

---

## 📁 File Locations

- **Uploaded PDFs**: `backend/uploads/pdfs/`
- **Generated Excel**: `backend/uploads/exports/`
- **Sample PDF**: `48250353-20250901,,.pdf`
- **Excel Template**: `Vodafone BW-Sep'2025.xlsx`

---

## 🎯 Default Ports

- **Backend API**: http://localhost:5000
- **Frontend UI**: http://localhost:3000
- **MySQL**: localhost:3306

---

## 📊 Sample Test

1. Use the included PDF: `48250353-20250901,,.pdf`
2. Batch name: "Test Run"
3. Enable/disable AI extraction
4. Upload and process
5. Download Excel and verify data

**Expected fields**:
- Invoice: EIMH082500565481
- Date: 01.09.25
- Amount: 2,131.37
- Company: JTM INTERNET PRIVATE LIMITED

---

## 📚 More Information

- **Complete Setup**: See `SETUP_GUIDE.md`
- **API Reference**: See `API_DOCUMENTATION.md`
- **Testing**: See `TESTING_GUIDE.md`
- **Project Info**: See `PROJECT_SUMMARY.md`

---

## 🆘 Quick Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Reset database
cd backend && npm run init-db

# Install dependencies
npm install

# Check MySQL
mysql -u root -p

# View logs
# Backend: Check terminal output
# Frontend: Open browser console (F12)
```

---

## ✅ Pre-flight Checklist

Before first run:
- [ ] Node.js installed (v18+)
- [ ] MySQL installed and running
- [ ] `.env` file created in backend/
- [ ] MySQL password set in `.env`
- [ ] Dependencies installed (both backend & frontend)
- [ ] Database initialized

---

## 🎉 You're Ready!

The application should now be running. Open your browser to:
**http://localhost:3000**

Start uploading PDFs and watch the magic happen! ✨

---

**Need help?** Check the documentation files or review error messages in the terminal.
