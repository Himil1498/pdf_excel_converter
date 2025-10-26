# FAQ & Troubleshooting Guide

## Frequently Asked Questions

### General Questions

#### Q1: What types of PDFs can this application process?

**A:** The application works best with:
- ✅ **Text-based PDFs** - PDFs with selectable text
- ✅ **Structured invoices** - Bills, invoices with consistent formats
- ✅ **Multi-vendor formats** - Vodafone, and custom vendors (with templates)

**Limitations**:
- ❌ **Scanned PDFs** - Image-based PDFs need OCR (future feature)
- ❌ **Complex layouts** - PDFs with tables/images may have issues
- ❌ **Password-protected** - Encrypted PDFs need to be decrypted first

#### Q2: How many PDFs can I process at once?

**A:**
- **Maximum**: 1000 PDFs per batch (configurable in `.env`)
- **Recommended**: 100-500 PDFs for optimal performance
- **Single file limit**: 10MB per PDF (configurable)

#### Q3: How long does processing take?

**A:** Processing time depends on several factors:

| Batch Size | With AI | Without AI |
|------------|---------|------------|
| 10 PDFs    | 30-60 seconds | 10-20 seconds |
| 100 PDFs   | 8-15 minutes | 3-5 minutes |
| 500 PDFs   | 30-60 minutes | 10-15 minutes |
| 1000 PDFs  | 60-90 minutes | 20-30 minutes |

**Factors affecting speed**:
- AI extraction (slower but more accurate)
- PDF file size and complexity
- Concurrent processing setting
- Server resources (CPU, RAM)

#### Q4: Do I need an OpenAI API key?

**A:**
- **No, it's optional!** The app works without AI using regex-based extraction
- **With AI**: Higher accuracy (90%+), supports varied formats
- **Without AI**: Faster processing, lower cost, template-based extraction

**Recommendation**: Start without AI, add it later if needed for better accuracy.

#### Q5: What data fields are extracted?

**A:** 50+ fields including:

**Invoice Details**:
- Invoice number, bill date, due date
- Amounts (subtotal, tax, total)
- Bill ID, relationship number

**Company Information**:
- Company name and addresses
- Contact person and phone
- City, state, PIN, GSTIN

**Financial Data**:
- Tax breakdown (CGST, SGST, IGST)
- Tax rates and percentages
- Currency code

**Service Details**:
- Circuit ID, control number
- Bandwidth (Mbps)
- Plan name, product details

**Custom Fields** (you can add more!)

#### Q6: Can I customize which fields are extracted?

**A:** Yes! Three ways:

1. **Templates (Easy)**: Create extraction templates via UI
2. **Custom Fields**: Define new fields in database
3. **Code Modification**: Edit backend services for complete control

See `CUSTOMIZATION_GUIDE.md` for details.

#### Q7: What format is the output Excel file?

**A:**
- **Format**: .xlsx (Excel 2007+)
- **Structure**: One row per PDF
- **Columns**: 50+ fields (customizable)
- **Styling**: Headers, formatting, filters included
- **Compatible with**: Excel, Google Sheets, LibreOffice

#### Q8: Can I process PDFs from different vendors in one batch?

**A:**
- **With AI**: Yes! AI auto-detects different formats
- **Without AI**: Best to use separate batches per vendor
- **Recommendation**: Use AI mode or create templates for each vendor

#### Q9: Is my data secure?

**A:**
- PDFs are stored locally on your server
- Database is local (MySQL)
- No data sent to third parties (except OpenAI if AI is enabled)
- Files can be deleted after processing
- Use HTTPS in production for encrypted transfer

For production, implement:
- User authentication
- File encryption
- Regular backups
- Access controls

#### Q10: Can I use this for commercial purposes?

**A:** Yes, the application is designed for commercial use. Consider:
- OpenAI API costs if using AI extraction
- Server/hosting costs
- MySQL database licensing (free for most uses)
- Compliance with data privacy regulations (GDPR, etc.)

---

### Technical Questions

#### Q11: What are the system requirements?

**Minimum**:
- Node.js 18+
- MySQL 8.0+
- 4GB RAM
- 10GB disk space

**Recommended** (for 1000 PDFs):
- Node.js 18+
- MySQL 8.0+
- 8GB RAM
- 50GB disk space
- Multi-core CPU

#### Q12: Can I run this on Windows/Mac/Linux?

**A:** Yes! The application runs on:
- ✅ Windows 10/11
- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (Ubuntu, Debian, CentOS)

#### Q13: Can I deploy to cloud services?

**A:** Yes! Supported platforms:
- ✅ AWS (EC2, RDS, S3)
- ✅ Google Cloud Platform
- ✅ Microsoft Azure
- ✅ DigitalOcean
- ✅ Heroku
- ✅ Docker/Kubernetes
- ✅ Any VPS with Node.js support

See `CUSTOMIZATION_GUIDE.md` → Deployment section.

#### Q14: Does it support multiple users?

**A:**
- **Current**: Single-user mode (no authentication)
- **Can be added**: User authentication system included in customization guide
- **See**: `CUSTOMIZATION_GUIDE.md` → Feature Modifications → Adding User Authentication

#### Q15: Can I process PDFs via API without the UI?

**A:** Yes! Complete REST API available:

```bash
# Upload via API
curl -X POST http://localhost:5000/api/upload \
  -F "batchName=API Test" \
  -F "pdfs=@invoice1.pdf" \
  -F "pdfs=@invoice2.pdf" \
  -F "useAI=true"

# Get status
curl http://localhost:5000/api/batches/1/status

# Download Excel
curl -O http://localhost:5000/api/batches/1/download
```

See `API_DOCUMENTATION.md` for complete reference.

---

## Troubleshooting Guide

### Installation Issues

#### Issue 1: "Node.js not found" or "npm not found"

**Symptoms**:
```
'node' is not recognized as an internal or external command
'npm' is not recognized as an internal or external command
```

**Solutions**:
1. Install Node.js from https://nodejs.org/
2. Restart terminal/command prompt
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```
4. If still not working, add Node.js to PATH:
   - Windows: Add `C:\Program Files\nodejs` to PATH
   - Mac/Linux: Add to `.bashrc` or `.zshrc`

#### Issue 2: "MySQL connection failed" or "ECONNREFUSED"

**Symptoms**:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
ER_ACCESS_DENIED_ERROR
Can't connect to MySQL server on 'localhost'
```

**Solutions**:

**Step 1**: Check MySQL is running
```bash
# Windows
sc query MySQL80

# Mac
brew services list

# Linux
sudo systemctl status mysql
```

**Step 2**: Start MySQL if stopped
```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

**Step 3**: Verify credentials
```bash
# Test MySQL login
mysql -u root -p
# Enter your password

# If successful, check database exists
SHOW DATABASES;
```

**Step 4**: Update `.env` file
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_password_here
DB_NAME=pdf_excel_converter
```

**Step 5**: Check firewall
```bash
# Windows: Allow port 3306
# Linux: sudo ufw allow 3306
```

#### Issue 3: "Cannot find module 'express'"

**Symptoms**:
```
Error: Cannot find module 'express'
Error: Cannot find module 'mysql2'
```

**Solutions**:

1. Install backend dependencies:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

3. Check `package.json` exists in both folders

4. Clear npm cache if needed:
```bash
npm cache clean --force
```

#### Issue 4: Database initialization fails

**Symptoms**:
```
✗ Database initialization failed
ERROR 1044: Access denied for user
Table 'pdf_excel_converter.upload_batches' doesn't exist
```

**Solutions**:

**Option 1**: Run init script
```bash
cd backend
npm run init-db
```

**Option 2**: Manual database creation
```bash
mysql -u root -p < ../database/schema.sql
```

**Option 3**: Grant proper permissions
```sql
GRANT ALL PRIVILEGES ON pdf_excel_converter.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

**Option 4**: Create database manually
```sql
CREATE DATABASE pdf_excel_converter;
USE pdf_excel_converter;
-- Then run the schema.sql content
```

#### Issue 5: Port already in use

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::5000
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions**:

**Option 1**: Kill process using port
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Option 2**: Change port in `.env`
```env
# Backend
PORT=5001

# Frontend (vite.config.js)
server: { port: 3001 }
```

---

### Runtime Errors

#### Error 1: Upload fails / Files not uploading

**Symptoms**:
- Upload button not working
- "Network error" message
- Files disappear after selection

**Solutions**:

1. **Check backend is running**:
```bash
curl http://localhost:5000/api/health
# Should return: {"success":true}
```

2. **Check file size**:
- Default limit: 10MB per file
- Increase in `.env`:
```env
MAX_FILE_SIZE=20971520  # 20MB
```

3. **Check file count**:
- Default limit: 1000 files
- Adjust if needed:
```env
MAX_FILES_PER_BATCH=2000
```

4. **Check browser console** (F12):
- Look for CORS errors
- Check network tab for failed requests

5. **Verify upload directory exists**:
```bash
mkdir -p backend/uploads/pdfs
mkdir -p backend/uploads/exports
chmod 755 backend/uploads
```

6. **Check backend logs**:
- Terminal running backend shows errors
- Look for multer or filesystem errors

#### Error 2: Processing stuck at "pending" or "processing"

**Symptoms**:
- Batch stays in "processing" forever
- No progress updates
- Files not being processed

**Solutions**:

1. **Check backend logs**:
- Look for errors in terminal
- Check for crashed processes

2. **Restart backend**:
```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

3. **Check database status**:
```sql
SELECT * FROM pdf_records WHERE batch_id = 1;
-- Look for error_message field
```

4. **Check OpenAI API** (if using AI):
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

5. **Reset stuck batch**:
```sql
UPDATE upload_batches SET status = 'failed' WHERE id = 1;
UPDATE pdf_records SET status = 'failed' WHERE batch_id = 1;
```

6. **Check system resources**:
```bash
# Check RAM usage
free -h  # Linux
top      # Mac
taskmgr  # Windows

# Check disk space
df -h
```

#### Error 3: PDF parsing fails / No data extracted

**Symptoms**:
- Processing completes but Excel is empty
- "Failed" status on PDF files
- No extracted data in database

**Solutions**:

1. **Check PDF is text-based**:
- Open PDF and try to select text
- If you can't select text, it's a scanned image (needs OCR)

2. **Try without AI first**:
- Disable AI extraction
- Use template-based extraction

3. **Check PDF file**:
- Ensure PDF is not corrupted
- Try opening in Adobe Reader
- Check file size (not 0 bytes)

4. **View extraction patterns**:
```javascript
// Test extraction manually
const pdfParse = require('pdf-parse');
const fs = require('fs');

fs.readFile('test.pdf', (err, data) => {
  pdfParse(data).then(result => {
    console.log(result.text);
  });
});
```

5. **Create custom template**:
- Go to Templates page
- Create template matching your PDF format
- Test with one PDF first

6. **Check error logs**:
```sql
SELECT * FROM processing_logs WHERE pdf_record_id = 1;
```

#### Error 4: Excel download fails / File not found

**Symptoms**:
- Download button doesn't work
- "Excel file not yet generated" error
- 404 error on download

**Solutions**:

1. **Check batch is completed**:
```bash
curl http://localhost:5000/api/batches/1/status
# status should be "completed"
```

2. **Check Excel file exists**:
```bash
ls backend/uploads/exports/
# Look for batch_*.xlsx files
```

3. **Check file path in database**:
```sql
SELECT excel_file_path FROM upload_batches WHERE id = 1;
```

4. **Regenerate Excel**:
- Delete batch and re-process
- Or implement manual regeneration endpoint

5. **Check file permissions**:
```bash
chmod 644 backend/uploads/exports/*.xlsx
```

#### Error 5: Frontend not connecting to backend

**Symptoms**:
- API calls fail
- "Network Error" in console
- CORS errors

**Solutions**:

1. **Check CORS configuration**:
```javascript
// backend/server.js
const allowedOrigins = ['http://localhost:3000'];
```

2. **Check API URL**:
```javascript
// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';
```

3. **Check backend is running**:
```bash
curl http://localhost:5000/api/health
```

4. **Check browser console** (F12):
- Look for network errors
- Check request/response in Network tab

5. **Disable browser extensions**:
- Ad blockers may interfere
- Try incognito mode

---

### Performance Issues

#### Issue 1: Slow processing / Taking too long

**Solutions**:

1. **Increase concurrent processes**:
```env
MAX_CONCURRENT_PROCESSES=10  # Default: 5
```

2. **Disable AI extraction**:
- Use regex mode for faster processing
- AI is 3-5x slower than regex

3. **Optimize database**:
```sql
-- Add indexes
CREATE INDEX idx_batch_status ON upload_batches(status);
ANALYZE TABLE upload_batches;
```

4. **Check system resources**:
```bash
# Monitor CPU/RAM usage
top  # Linux/Mac
```

5. **Process smaller batches**:
- Split 1000 PDFs into 10 batches of 100
- More manageable and faster feedback

#### Issue 2: High memory usage / Out of memory

**Solutions**:

1. **Reduce concurrent processes**:
```env
MAX_CONCURRENT_PROCESSES=3
```

2. **Increase server RAM**:
- Minimum 4GB RAM
- Recommended 8GB for large batches

3. **Process in smaller batches**:
- 100-200 PDFs at a time
- Clear completed batches regularly

4. **Check for memory leaks**:
```bash
# Monitor Node.js memory
node --max-old-space-size=4096 server.js
```

5. **Restart server periodically**:
```bash
# Using PM2
pm2 restart pdf-converter-api
```

#### Issue 3: Database slow / Queries timing out

**Solutions**:

1. **Optimize database**:
```sql
-- Add indexes
CREATE INDEX idx_pdf_batch ON pdf_records(batch_id);
CREATE INDEX idx_invoice_batch ON invoice_data(batch_id);

-- Analyze tables
ANALYZE TABLE upload_batches;
ANALYZE TABLE pdf_records;
ANALYZE TABLE invoice_data;
```

2. **Increase MySQL buffer**:
```ini
# my.cnf or my.ini
[mysqld]
innodb_buffer_pool_size = 2G
query_cache_size = 256M
```

3. **Clean old data**:
```sql
-- Delete old batches
DELETE FROM upload_batches WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

4. **Use connection pooling**:
- Already configured in `backend/config/database.js`
- Adjust `connectionLimit` if needed

---

### Data Extraction Issues

#### Issue 1: Wrong data extracted / Incorrect values

**Solutions**:

1. **Enable AI extraction**:
- More accurate than regex
- Auto-adapts to different formats

2. **Create custom template**:
- Analyze PDF structure
- Define specific regex patterns
- Test with sample PDFs

3. **Adjust regex patterns**:
```javascript
// Example: More flexible invoice number pattern
/Invoice\s*(?:No|Number|#)?[:.\\s]*([A-Z0-9-]+)/i
```

4. **Check date formats**:
```javascript
// Support multiple date formats
/Date[:.\\s]*(\\d{2}[./\\-]\\d{2}[./\\-]\\d{4})/i
```

5. **Test extraction manually**:
- Use regex101.com to test patterns
- Extract PDF text first, then test patterns

#### Issue 2: Missing fields / Empty columns in Excel

**Solutions**:

1. **Check PDF contains the data**:
- Open PDF and verify field exists
- Check spelling and format

2. **Update extraction patterns**:
- Patterns might be too strict
- Add flexibility to regex

3. **Check field mapping**:
```javascript
// backend/services/excelGenerator.js
mapDataToRow(extractedData, filename) {
  // Verify all fields are mapped
}
```

4. **Enable debug logging**:
```javascript
// Log extracted data
console.log('Extracted:', extractedData);
```

5. **Use AI extraction**:
- Better at finding fields in varied formats

#### Issue 3: Duplicate data / Multiple rows for one PDF

**Solutions**:

1. **Check database queries**:
```sql
SELECT COUNT(*), filename FROM invoice_data GROUP BY filename HAVING COUNT(*) > 1;
```

2. **Add unique constraints**:
```sql
ALTER TABLE invoice_data ADD UNIQUE INDEX idx_unique_pdf (pdf_record_id);
```

3. **Clear duplicate data**:
```sql
DELETE i1 FROM invoice_data i1
INNER JOIN invoice_data i2
WHERE i1.id > i2.id AND i1.pdf_record_id = i2.pdf_record_id;
```

---

### Excel Output Issues

#### Issue 1: Excel file won't open / Corrupted file

**Solutions**:

1. **Check file size**:
```bash
ls -lh backend/uploads/exports/*.xlsx
# Should not be 0 bytes
```

2. **Verify Excel generation**:
```sql
SELECT * FROM upload_batches WHERE excel_file_path IS NOT NULL;
```

3. **Regenerate Excel**:
- Delete batch
- Re-upload and process PDFs

4. **Check ExcelJS errors**:
- Look for errors in backend logs
- Test Excel generation separately

5. **Try different Excel viewer**:
- Try Google Sheets
- Try LibreOffice Calc
- Try Excel Online

#### Issue 2: Missing columns / Wrong column order

**Solutions**:

1. **Check column definitions**:
```javascript
// backend/services/excelGenerator.js
defineColumns(customFields = null) {
  const defaultColumns = [
    { header: 'Filename', key: 'filename', width: 25 },
    // Add your columns here
  ];
}
```

2. **Update field mappings**:
```javascript
mapDataToRow(extractedData, filename) {
  return {
    filename: filename,
    // Add your mappings here
  };
}
```

3. **Create custom column template**:
- Modify `excelGenerator.js`
- Match your Excel template exactly

#### Issue 3: Formatting issues / No styling

**Solutions**:

1. **Check style configuration**:
```javascript
styleHeaderRow() {
  const headerRow = this.worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { /* styling */ };
}
```

2. **Add custom formatting**:
```javascript
// Format currency columns
cell.numFmt = '#,##0.00';

// Format date columns
cell.numFmt = 'dd.mm.yyyy';
```

---

### Security Concerns

#### Q: How do I secure my production deployment?

**A:** Follow these steps:

1. **Enable HTTPS**:
```bash
# Use Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

2. **Add authentication**:
- See `CUSTOMIZATION_GUIDE.md` → User Authentication

3. **Set strong passwords**:
```env
DB_PASSWORD=use_very_strong_password_here
JWT_SECRET=generate_random_secret_key
```

4. **Configure firewall**:
```bash
sudo ufw allow 22  # SSH
sudo ufw allow 80  # HTTP
sudo ufw allow 443 # HTTPS
sudo ufw enable
```

5. **Regular backups**:
```bash
# Daily database backup
mysqldump pdf_excel_converter > backup.sql
```

6. **Update dependencies**:
```bash
npm audit fix
npm update
```

7. **Hide error details**:
```javascript
// Production error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error'
    // Don't expose stack trace in production
  });
});
```

---

## Getting Help

### When You're Really Stuck

1. **Check all documentation**:
   - README.md - Overview
   - SETUP_GUIDE.md - Installation
   - API_DOCUMENTATION.md - API reference
   - CUSTOMIZATION_GUIDE.md - Modifications
   - This file - Troubleshooting

2. **Check logs**:
   - Backend terminal output
   - Frontend browser console (F12)
   - MySQL error log
   - System logs

3. **Test components individually**:
   - Database connection: `mysql -u root -p`
   - Backend API: `curl http://localhost:5000/api/health`
   - Frontend: Open `http://localhost:3000`

4. **Try minimal example**:
   - Upload just 1 PDF
   - Use sample PDF included
   - Disable AI extraction

5. **Check GitHub issues**:
   - Search for similar problems
   - Create new issue with details

6. **Provide details when asking for help**:
   - Operating system and version
   - Node.js and MySQL versions
   - Error messages (full text)
   - Steps to reproduce
   - What you've already tried

### Useful Commands for Debugging

```bash
# Check service status
systemctl status mysql  # Linux
sc query MySQL80        # Windows
brew services list      # Mac

# Check ports
netstat -tulpn | grep 5000  # Linux
netstat -ano | findstr 5000 # Windows
lsof -i :5000              # Mac

# Check processes
ps aux | grep node         # Linux/Mac
tasklist | findstr node    # Windows

# Check logs
tail -f backend/logs/*.log    # Linux/Mac
type backend\logs\*.log       # Windows

# Database queries
mysql -u root -p pdf_excel_converter -e "SELECT COUNT(*) FROM upload_batches;"

# Disk space
df -h              # Linux/Mac
wmic logicaldisk  # Windows

# Memory usage
free -h           # Linux
vm_stat           # Mac
systeminfo        # Windows
```

---

## Quick Reference

### Common File Paths

```
Backend:
  - Server: backend/server.js
  - Config: backend/.env
  - Database: backend/config/database.js
  - Uploads: backend/uploads/
  - Logs: backend/logs/

Frontend:
  - App: frontend/src/App.jsx
  - API: frontend/src/services/api.js
  - Build: frontend/dist/

Database:
  - Schema: database/schema.sql
  - Data: MySQL data directory

Documentation:
  - All guides in root folder
```

### Default Configuration

```env
Backend Port: 5000
Frontend Port: 3000
MySQL Port: 3306

Max File Size: 10MB
Max Files: 1000
Concurrent Processes: 5

AI: Optional (OpenAI GPT-4)
Auth: None (can be added)
```

### Emergency Reset

If everything is broken:

```bash
# 1. Stop all services
# Kill backend (Ctrl+C)
# Kill frontend (Ctrl+C)
# Stop MySQL if needed

# 2. Clean install
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install

# 3. Reset database
mysql -u root -p
DROP DATABASE pdf_excel_converter;
CREATE DATABASE pdf_excel_converter;
exit;

cd ../backend
npm run init-db

# 4. Clear uploads
rm -rf uploads/*
mkdir -p uploads/pdfs uploads/exports

# 5. Restart
npm run dev  # Backend
# New terminal
cd frontend && npm run dev  # Frontend
```

---

**Still having issues?** Create a detailed report with:
- Error messages
- System information
- Steps to reproduce
- What you've tried

Check documentation files or contact support!
