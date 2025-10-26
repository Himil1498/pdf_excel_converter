# Testing Guide

## Quick Test Checklist

Use this checklist to verify the application is working correctly.

### ✓ Backend Tests

#### 1. Database Connection Test
```bash
cd backend
npm run init-db
```
**Expected**:
- ✓ Connected to MySQL server
- ✓ Schema file loaded
- ✓ Database schema created successfully

#### 2. Server Start Test
```bash
cd backend
npm run dev
```
**Expected**:
- Server running on http://localhost:5000
- ✓ Database connected successfully
- No error messages

#### 3. Health Check Test
```bash
curl http://localhost:5000/api/health
```
**Expected Response**:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-01-15T..."
}
```

#### 4. Templates Test
```bash
curl http://localhost:5000/api/templates
```
**Expected**: List of templates including default Vodafone template

### ✓ Frontend Tests

#### 1. Development Server
```bash
cd frontend
npm run dev
```
**Expected**:
- Vite dev server starts
- Local URL displayed
- No compilation errors

#### 2. UI Loading
Open `http://localhost:3000` in browser

**Expected**:
- Application loads without errors
- Navigation menu visible (Upload, Batches, Templates)
- No console errors (F12)

### ✓ Integration Tests

#### Test 1: Upload Single PDF

1. **Prepare**:
   - Use the sample PDF: `48250353-20250901,,.pdf`
   - Go to Upload page

2. **Steps**:
   - Enter batch name: "Test Single PDF"
   - Enable AI extraction (if you have API key)
   - Drag & drop or select the PDF
   - Click "Upload and Process"

3. **Expected Results**:
   - Success toast message appears
   - Redirected to batch details page
   - Processing starts immediately
   - File status changes from "pending" → "processing" → "completed"
   - Processing time shown (2-5 seconds)
   - Download button appears when complete

4. **Verify Excel**:
   - Click "Download Excel"
   - Open the Excel file
   - Check extracted data:
     - Invoice number: EIMH082500565481
     - Bill date: 01.09.25
     - Total amount: 2,131.37
     - Company name: JTM INTERNET PRIVATE LIMITED
     - Circuit ID: ENT31PUNPUN148732

#### Test 2: Upload Multiple PDFs (10 files)

1. **Prepare**:
   - Copy the sample PDF 10 times with different names
   - Or use your own PDF invoices

2. **Steps**:
   - Batch name: "Test Multiple PDFs"
   - Select all 10 PDFs
   - Upload and process

3. **Expected Results**:
   - All 10 files appear in the list
   - Progress bar shows percentage
   - Batches page shows processing status
   - All files complete successfully
   - Single Excel file with 10 rows

#### Test 3: Template Selection

1. **Create Template** (Templates page):
   - Click "New Template"
   - Name: "Test Template"
   - Vendor: "Test Vendor"
   - Save

2. **Use Template** (Upload page):
   - Select the new template from dropdown
   - Upload PDF
   - Process

3. **Expected**:
   - Template applied during extraction
   - Data extracted according to template patterns

#### Test 4: Batch Management

1. **View Batches**:
   - Go to Batches page
   - See all test batches created

2. **View Details**:
   - Click on a batch
   - See detailed status
   - View individual file status
   - Check processing logs

3. **Delete Batch**:
   - Click delete icon
   - Confirm deletion
   - Batch removed from list

### ✓ Performance Tests

#### Test 1: Large File (5-10MB PDF)

1. Use a large PDF file
2. Upload and measure processing time
3. **Expected**: 5-10 seconds max

#### Test 2: Many Files (50 PDFs)

1. Upload 50 PDFs in one batch
2. Monitor system resources
3. **Expected**:
   - Completes in 3-10 minutes
   - No server crashes
   - No memory leaks

#### Test 3: Concurrent Batches

1. Start batch 1 (20 PDFs)
2. Immediately start batch 2 (20 PDFs)
3. **Expected**:
   - Both batches process
   - No conflicts
   - Reasonable processing time

### ✓ Error Handling Tests

#### Test 1: Invalid File Type

1. Try to upload a .txt or .docx file
2. **Expected**: Error message "Only PDF files are allowed"

#### Test 2: Empty Batch Name

1. Leave batch name empty
2. Try to upload
3. **Expected**: Validation error

#### Test 3: Corrupted PDF

1. Upload a corrupted/invalid PDF
2. **Expected**:
   - File marked as "failed"
   - Error message in logs
   - Other files continue processing

#### Test 4: Database Connection Lost

1. Stop MySQL server while processing
2. **Expected**:
   - Graceful error handling
   - Clear error message
   - Server remains stable

### ✓ API Tests

Use these curl commands or Postman/Insomnia:

#### Get All Batches
```bash
curl -X GET http://localhost:5000/api/batches
```

#### Get Batch Status
```bash
curl -X GET http://localhost:5000/api/batches/1/status
```

#### Get Templates
```bash
curl -X GET http://localhost:5000/api/templates
```

#### Create Template
```bash
curl -X POST http://localhost:5000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "API Test Template",
    "vendorName": "Test Vendor",
    "fieldMappings": {
      "invoice_number": {
        "pattern": "Invoice:\\\\s*([A-Z0-9]+)",
        "required": true
      }
    },
    "isDefault": false
  }'
```

### ✓ UI/UX Tests

#### Visual Tests

1. **Responsive Design**:
   - Test on different screen sizes
   - Mobile view (< 640px)
   - Tablet view (640-1024px)
   - Desktop view (> 1024px)

2. **Loading States**:
   - Upload progress bar animates
   - Spinner shows while loading
   - Auto-refresh indicator on batch details

3. **Error States**:
   - Error messages are clear
   - Error styling is visible
   - Error recovery is possible

#### Accessibility Tests

1. Keyboard navigation works
2. Tab order is logical
3. Buttons have hover states
4. Color contrast is sufficient

### ✓ Data Validation Tests

After processing a PDF, verify in database:

```sql
USE pdf_excel_converter;

-- Check batch record
SELECT * FROM upload_batches ORDER BY created_at DESC LIMIT 1;

-- Check PDF records
SELECT * FROM pdf_records WHERE batch_id = 1;

-- Check extracted data
SELECT * FROM invoice_data WHERE batch_id = 1;

-- Check logs
SELECT * FROM processing_logs WHERE batch_id = 1;
```

Expected:
- All tables populated correctly
- JSON data is valid
- Dates are formatted correctly
- Numbers are stored as correct types

### Common Test Failures & Solutions

#### Backend won't start
- **Check**: MySQL is running
- **Check**: .env file exists and is configured
- **Check**: Port 5000 is available

#### Frontend won't connect to backend
- **Check**: Backend is running
- **Check**: CORS is configured correctly
- **Check**: API URL in frontend is correct

#### PDF processing fails
- **Check**: PDF is valid and not corrupted
- **Check**: PDF contains text (not scanned image)
- **Check**: OpenAI API key is valid (if using AI)
- **Check**: Server has enough memory

#### Excel download fails
- **Check**: Batch is completed
- **Check**: Excel file exists in uploads/exports
- **Check**: File permissions are correct

#### Data extraction is incorrect
- **Check**: Template patterns are correct
- **Check**: PDF format matches expected structure
- **Try**: Enable AI extraction for better accuracy
- **Check**: Regex patterns in template

### Performance Benchmarks

Expected performance on standard hardware:

| Test Case | Expected Time | Notes |
|-----------|---------------|-------|
| Single PDF (without AI) | 1-2 seconds | Regex extraction |
| Single PDF (with AI) | 3-5 seconds | GPT-4 extraction |
| 100 PDFs (without AI) | 2-4 minutes | Concurrent: 5 |
| 100 PDFs (with AI) | 8-15 minutes | Concurrent: 5 |
| 1000 PDFs (without AI) | 15-30 minutes | Concurrent: 5 |
| 1000 PDFs (with AI) | 60-90 minutes | Concurrent: 5 |

**Note**: AI extraction is slower but more accurate, especially with varied formats.

### Automated Testing (Optional)

For automated testing, you can create test scripts:

```javascript
// backend/tests/upload.test.js
const request = require('supertest');
const app = require('../server');

describe('Upload API', () => {
  it('should upload PDF files', async () => {
    const res = await request(app)
      .post('/api/upload')
      .field('batchName', 'Test')
      .attach('pdfs', 'test.pdf');

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
  });
});
```

Run with:
```bash
npm test
```

### Load Testing (Advanced)

For stress testing with 1000+ PDFs:

1. Use Apache Bench (ab):
```bash
ab -n 1000 -c 10 http://localhost:5000/api/health
```

2. Monitor server resources:
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

3. Check database performance:
```sql
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads%';
```

### Final Verification

Before considering the application production-ready:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Performance meets requirements
- [ ] Error handling works correctly
- [ ] Data validation is accurate
- [ ] Security measures in place
- [ ] Documentation is complete
- [ ] Backup strategy defined
- [ ] Monitoring configured
- [ ] Logs are comprehensive

---

**Happy Testing!** 🚀

If you find bugs or issues, please document them with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. System information
5. Error logs
