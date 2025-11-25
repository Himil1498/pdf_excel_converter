# PDF to Excel Converter - Complete Website Workflow

**Last Updated**: November 24, 2025
**Status**: Production Ready
**Supported Vendors**: 7 (Vodafone, Tata, Airtel, Indus, Ascend, Sify, BSNL)

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Workflows](#user-workflows)
3. [Backend Processing Flow](#backend-processing-flow)
4. [Frontend Navigation](#frontend-navigation)
5. [API Request/Response Flow](#api-requestresponse-flow)
6. [Database Flow](#database-flow)
7. [File Processing Pipeline](#file-processing-pipeline)

---

## System Architecture

### High-Level Overview

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Browser   │────────▶│   Frontend  │────────▶│   Backend    │
│  (React UI) │◀────────│  (Port 5173)│◀────────│  (Port 5001) │
└─────────────┘         └─────────────┘         └──────┬───────┘
                                                        │
                                                        ▼
                        ┌─────────────┐         ┌──────────────┐
                        │   MySQL DB  │◀────────│  PDF Parser  │
                        │  (Port 3306)│         │   Service    │
                        └─────────────┘         └──────────────┘
                                                        │
                                                        ▼
                                                ┌──────────────┐
                                                │Excel Generator│
                                                └──────────────┘
```

### Technology Stack

**Frontend**:
- React 18 + Vite
- TailwindCSS + Dark Mode
- React Router v6
- Axios for API calls
- Lucide React (icons)
- React Hot Toast (notifications)

**Backend**:
- Node.js + Express.js
- MySQL2 (database driver)
- Multer (file uploads)
- pdf-parse (PDF extraction)
- ExcelJS (Excel generation)
- node-cron (scheduling)

**Database**:
- MySQL 8.0+
- 13 tables
- JSON fields for extracted data
- Full-text search support

---

## User Workflows

### Workflow 1: Upload & Process Invoices

```
1. User opens Upload Page (/upload)
   ├─▶ Selects vendor type (Vodafone, Tata, Airtel, etc.)
   ├─▶ Enters batch name
   ├─▶ Drags & drops PDF files (1-1000 files)
   ├─▶ Optional: Enable AI extraction
   └─▶ Clicks "Upload and Process"

2. Frontend sends POST request to /api/upload
   ├─▶ FormData with PDFs + metadata
   ├─▶ Files stored in uploads/pdfs/
   └─▶ Returns batchId

3. Backend processes PDFs in background
   ├─▶ Creates upload_batch record (status: pending)
   ├─▶ Creates pdf_records for each file
   ├─▶ Processes PDFs concurrently (5 at a time)
   │   ├─▶ Extract text using pdf-parse
   │   ├─▶ Apply vendor-specific regex patterns
   │   ├─▶ Store extracted_data as JSON
   │   └─▶ Update pdf_record status
   ├─▶ Generates Excel file automatically
   └─▶ Updates batch status (completed/partial/failed)

4. User views processing status
   ├─▶ Real-time status on Upload Page
   ├─▶ Progress bar shows completion
   └─▶ Redirects to Batches Page when done
```

### Workflow 2: View & Download Results

```
1. User navigates to Batches Page (/batches)
   └─▶ Shows all batches in reverse chronological order

2. User clicks "View Details" on a batch
   └─▶ Navigates to /batches/:id

3. Batch Details Page shows:
   ├─▶ Batch summary (name, vendor, counts, status)
   ├─▶ List of all PDF records
   ├─▶ Extracted data for each record
   ├─▶ Processing logs
   └─▶ Download buttons (Excel, CSV, JSON)

4. User clicks "Download Excel"
   ├─▶ GET /api/batches/:id/download
   ├─▶ Backend reads Excel file from uploads/exports/
   ├─▶ If not exists, regenerates from database
   ├─▶ Returns file with proper headers
   └─▶ Browser downloads batch_XX_timestamp.xlsx
```

### Workflow 3: Search Invoices

```
1. User opens Search Page (/search)
   └─▶ Advanced search interface loads

2. User enters search criteria:
   ├─▶ Keywords (full-text search)
   ├─▶ Vendor type filter
   ├─▶ Date range (bill_date)
   ├─▶ Amount range (min/max)
   └─▶ Batch filter

3. Frontend sends GET /api/search with query params
   └─▶ Backend queries invoice_data table

4. Results displayed in table format
   ├─▶ Filename, Bill Number, Date, Vendor, Amount
   ├─▶ Pagination (50 per page)
   └─▶ Export results option

5. Optional: Save search query
   └─▶ POST /api/search/save → stored in search_queries table
```

### Workflow 4: View Analytics

```
1. User opens Analytics Dashboard (/analytics)
   └─▶ Dashboard loads with default filters

2. Dashboard displays:
   ├─▶ Total Invoices Count
   ├─▶ Total Amount Processed
   ├─▶ Vendor Breakdown (pie chart)
   ├─▶ Monthly Trends (line chart)
   ├─▶ Tax Summary (CGST, SGST, IGST)
   └─▶ Top Branches by spending

3. User selects vendor filter
   ├─▶ GET /api/analytics/overview?vendor=vodafone
   ├─▶ Backend queries invoice_data grouped by month
   └─▶ Charts update dynamically

4. User exports analytics data
   └─▶ Downloads CSV/Excel report
```

### Workflow 5: Manage Templates

```
1. User opens Templates Page (/templates)
   └─▶ Shows all field templates

2. User clicks "Create Template"
   ├─▶ Modal opens with form
   ├─▶ Enter template name, vendor, description
   ├─▶ Define field mappings (JSON)
   └─▶ POST /api/templates

3. Backend stores template
   └─▶ INSERT INTO field_templates

4. Template can be used during upload
   └─▶ Select template in Upload Page dropdown
```

### Workflow 6: Schedule Recurring Jobs

```
1. User opens Scheduler Page (/scheduler)
   └─▶ Shows all scheduled jobs

2. User creates new job
   ├─▶ Job name & type
   ├─▶ Schedule (cron format)
   ├─▶ Configuration (vendor, folder path, etc.)
   └─▶ POST /api/scheduler/jobs

3. Backend creates scheduled job
   ├─▶ INSERT INTO scheduled_jobs
   └─▶ node-cron registers task

4. Job runs automatically
   ├─▶ Triggers at scheduled time
   ├─▶ Processes PDFs from configured folder
   ├─▶ Updates last_run_at, next_run_at
   └─▶ Logs execution results
```

### Workflow 7: Manual Corrections

```
1. User opens Batch Details Page
   └─▶ Clicks "Correct Data" on a record

2. Correction modal opens
   ├─▶ Shows current extracted values
   ├─▶ User edits incorrect fields
   ├─▶ Enters correction reason
   └─▶ POST /api/corrections

3. Backend applies correction
   ├─▶ Inserts into corrections table
   ├─▶ Updates invoice_data record
   ├─▶ Marks validation_error as resolved
   └─▶ Logs correction in processing_logs

4. Excel regenerated with corrected data
   └─▶ POST /api/batches/:id/regenerate-excel
```

---

## Backend Processing Flow

### PDF Processing Pipeline

```
┌──────────────────┐
│  Upload Request  │
│  (Multiple PDFs) │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  1. Create Batch Record              │
│     - Insert into upload_batches     │
│     - Status: 'pending'              │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  2. Store PDF Files                  │
│     - Save to uploads/pdfs/          │
│     - Generate unique filenames      │
│     - Create pdf_records entries     │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  3. Start Batch Processing           │
│     - Update batch status:           │
│       'processing'                   │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  4. Process PDFs Concurrently        │
│     - Max 5 concurrent processes     │
│     - For each PDF:                  │
│       ├─▶ Extract text (pdf-parse)  │
│       ├─▶ Apply regex patterns       │
│       ├─▶ Extract structured data    │
│       ├─▶ Store in extracted_data    │
│       ├─▶ Insert into invoice_data   │
│       └─▶ Update pdf_record status   │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  5. Generate Excel File              │
│     - Read all invoice_data          │
│     - Apply vendor-specific format   │
│     - Create Excel workbook          │
│     - Save to uploads/exports/       │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  6. Update Batch Status              │
│     - Count processed/failed files   │
│     - Status: 'completed' or         │
│       'partial' or 'failed'          │
│     - Update excel_file_path         │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  7. Return Response                  │
│     - batchId                        │
│     - status                         │
│     - file counts                    │
└──────────────────────────────────────┘
```

### Vendor-Specific Processing

Each vendor has custom extraction logic:

**1. Vodafone** (`extractWithRegexVodafone`):
```javascript
- Extracts: Invoice number, dates, amounts, GST details
- Parses: Branch names with regions
- Format: 110-column batch format
- Output: Custom Vodafone Excel template
```

**2. Tata** (`extractWithRegexTata`):
```javascript
- Extracts: Service details, line items, charges
- Parses: Multiple service types
- Format: 110+ column Tata format
- Output: Custom Tata Excel template
```

**3. Airtel** (`extractWithRegexAirtel`):
```javascript
- Extracts: ZOHO Books fields
- Parses: TDS/TCS, GST breakdown
- Format: 110-column ZOHO format
- Output: ZOHO-compatible Excel
```

**4-7. Indus, Ascend, Sify, BSNL**:
- Similar extraction patterns
- ZOHO-format output
- 109-110 columns each

---

## Frontend Navigation

### Page Structure

```
App.jsx (Root)
├─▶ ThemeProvider (Dark Mode)
├─▶ Router
    ├─▶ Layout (Sidebar + Header)
    │   ├─▶ Sidebar Navigation
    │   │   ├─▶ /upload (Upload Page)
    │   │   ├─▶ /batches (Batches List)
    │   │   ├─▶ /templates (Template Management)
    │   │   ├─▶ /analytics (Analytics Dashboard)
    │   │   ├─▶ /search (Advanced Search)
    │   │   ├─▶ /validation (Validation Errors)
    │   │   ├─▶ /corrections (Corrections History)
    │   │   ├─▶ /comparison (Invoice Comparison)
    │   │   └─▶ /scheduler (Job Scheduler)
    │   └─▶ ThemeToggle (Light/Dark Mode)
    └─▶ Routes
        ├─▶ / → Redirect to /upload
        ├─▶ /upload → UploadPage
        ├─▶ /batches → BatchesPage
        ├─▶ /batches/:id → BatchDetailsPage
        ├─▶ /templates → TemplatesPage
        ├─▶ /analytics → AnalyticsDashboardPage
        ├─▶ /search → SearchPage
        ├─▶ /validation → ValidationPage
        ├─▶ /corrections → CorrectionPage
        ├─▶ /comparison → ComparisonPage
        └─▶ /scheduler → SchedulerPage
```

### Component Hierarchy

```
UploadPage
├─▶ ConfirmDialog (delete confirmation)
├─▶ File drop zone (react-dropzone)
├─▶ Vendor selector dropdown
├─▶ Template selector dropdown
├─▶ Progress bar (during upload)
└─▶ Recent batches table

BatchesPage
├─▶ Filter controls (vendor, status, date)
├─▶ Batches table with actions
├─▶ Pagination
└─▶ Bulk actions (delete multiple)

BatchDetailsPage
├─▶ Batch summary card
├─▶ Download buttons (Excel, CSV, JSON, Errors)
├─▶ PDF records table with status
├─▶ InvoiceDetailsModal (view extracted data)
├─▶ Retry failed button
└─▶ Processing logs section

TemplatesPage
├─▶ Templates table
├─▶ TemplateModal (create/edit)
├─▶ CustomFieldModal (manage fields)
└─▶ Import/Export buttons

AnalyticsDashboardPage
├─▶ Summary cards (count, total amount)
├─▶ Vendor breakdown (pie chart)
├─▶ Monthly trends (line chart)
├─▶ Tax summary cards
└─▶ Filters (vendor, date range)
```

---

## API Request/Response Flow

### Example: Upload PDFs

**Request**:
```http
POST /api/upload
Content-Type: multipart/form-data

Fields:
- pdfs: File[] (1-1000 PDFs)
- batchName: string
- vendorType: enum (vodafone, tata, airtel, etc.)
- useAI: boolean
- templateId: number (optional)
```

**Processing**:
1. Multer middleware validates files
2. UploadController.uploadPDFs() handler
3. BatchProcessor.startProcessing()
4. PDFParser.parseAndExtract()
5. ExcelGenerator.generateBatchExcel()

**Response**:
```json
{
  "success": true,
  "message": "Batch upload started",
  "batchId": 42,
  "totalFiles": 100
}
```

### Example: Get Batch Details

**Request**:
```http
GET /api/batches/42
```

**Response**:
```json
{
  "success": true,
  "data": {
    "batch": {
      "id": 42,
      "batch_name": "Vodafone_Q1_2025",
      "vendor_type": "vodafone",
      "total_files": 100,
      "processed_files": 98,
      "failed_files": 2,
      "status": "partial",
      "excel_file_path": "uploads/exports/batch_42_...",
      "created_at": "2025-11-24T10:00:00.000Z"
    },
    "pdfRecords": [ /* Array of 100 PDF records */ ],
    "logs": [ /* Processing logs */ ]
  }
}
```

---

## Database Flow

### Data Flow Through Tables

```
1. Upload Request
   ↓
upload_batches (INSERT)
   ├─▶ id: 42
   ├─▶ batch_name: "Test Batch"
   ├─▶ vendor_type: "vodafone"
   ├─▶ status: "pending"
   └─▶ total_files: 10
   ↓
pdf_records (INSERT × 10)
   ├─▶ batch_id: 42
   ├─▶ filename: "invoice1.pdf"
   ├─▶ file_path: "uploads/pdfs/uuid_invoice1.pdf"
   └─▶ status: "pending"
   ↓
Processing Starts
   ↓
pdf_records (UPDATE)
   └─▶ status: "processing"
   ↓
PDF Parsing Complete
   ↓
pdf_records (UPDATE)
   ├─▶ status: "completed"
   ├─▶ extracted_data: { JSON }
   └─▶ processing_time_ms: 350
   ↓
invoice_data (INSERT)
   ├─▶ pdf_record_id: 256
   ├─▶ batch_id: 42
   ├─▶ bill_number: "INV123"
   ├─▶ bill_date: "2025-11-01"
   ├─▶ total: 45000.00
   └─▶ ... (110 fields)
   ↓
processing_logs (INSERT)
   ├─▶ batch_id: 42
   ├─▶ pdf_record_id: 256
   ├─▶ log_level: "info"
   └─▶ message: "File processed successfully"
   ↓
All PDFs Processed
   ↓
upload_batches (UPDATE)
   ├─▶ status: "completed"
   ├─▶ processed_files: 10
   ├─▶ failed_files: 0
   └─▶ excel_file_path: "uploads/exports/batch_42.xlsx"
```

---

## File Processing Pipeline

### File Storage Structure

```
uploads/
├── pdfs/                           # Stored PDF files
│   ├── uuid_invoice1.pdf
│   ├── uuid_invoice2.pdf
│   └── ...
└── exports/                        # Generated Excel files
    ├── batch_42_2025-11-24T10-00-00.xlsx
    ├── batch_43_2025-11-24T11-30-00.xlsx
    └── ...
```

### Excel Generation Flow

```
1. Gather Data
   ├─▶ SELECT * FROM invoice_data WHERE batch_id = ?
   └─▶ Retrieve 100+ invoice records

2. Determine Vendor Format
   ├─▶ Check batch.vendor_type
   └─▶ Load appropriate column definitions

3. Create Workbook
   ├─▶ ExcelJS.Workbook()
   ├─▶ Add worksheet: "Invoice Data"
   └─▶ Set column widths

4. Write Header Row
   ├─▶ Row 1: Column names
   ├─▶ Apply header styling (bold, background)
   └─▶ Freeze first row

5. Write Data Rows
   ├─▶ For each invoice:
   │   ├─▶ Map extracted_data to columns
   │   ├─▶ Format dates (YYYY-MM-DD)
   │   ├─▶ Format numbers (decimals)
   │   └─▶ Apply cell types (date, number, string)
   └─▶ Row 2 onwards: Data

6. Apply Vendor-Specific Formatting
   ├─▶ Vodafone: 110 columns, batch format
   ├─▶ Tata: 110+ columns, Tata format
   ├─▶ Airtel: 110 columns, ZOHO format
   └─▶ Others: ZOHO format

7. Save File
   ├─▶ Generate filename: batch_XX_timestamp.xlsx
   ├─▶ Save to uploads/exports/
   └─▶ Update batch.excel_file_path

8. Return File Path
   └─▶ Ready for download
```

---

## Error Handling Flow

### Failed PDF Processing

```
1. PDF Parsing Fails
   ↓
Catch Error
   ↓
pdf_records (UPDATE)
   ├─▶ status: "failed"
   └─▶ error_message: "PDF extraction failed: ..."
   ↓
processing_logs (INSERT)
   ├─▶ log_level: "error"
   └─▶ message: Error details
   ↓
upload_batches (UPDATE)
   ├─▶ failed_files: +1
   └─▶ status: "partial" (if some succeeded)
   ↓
User sees error in Batch Details
   ├─▶ Red status badge
   ├─▶ Error message displayed
   └─▶ "Retry" button available
   ↓
User clicks "Retry"
   ↓
POST /api/batches/42/files/256/retry
   ↓
Reset status to "pending"
   ↓
Reprocess PDF
```

---

## Real-Time Features

### Batch Processing Status

```
Frontend Poll Strategy:
1. User uploads PDFs
2. Upload Page polls /api/batches/:id every 2 seconds
3. Shows real-time progress:
   - Processed: X / Y files
   - Progress bar: (X/Y) * 100%
   - Status: "Processing..."
4. When status = "completed":
   - Stop polling
   - Show success message
   - Enable download buttons
```

### Live Notifications

```
Toast Notifications (react-hot-toast):
- Success: "Batch uploaded successfully!"
- Error: "Upload failed: ..."
- Warning: "Some files failed to process"
- Info: "Processing in background..."
```

---

## Security & Validation

### File Upload Security

```
1. File Type Validation
   ├─▶ Only accept .pdf files
   └─▶ Reject: .exe, .bat, .js, etc.

2. File Size Validation
   ├─▶ Max: 10MB per file
   └─▶ Reject larger files

3. Virus Scanning (optional)
   └─▶ ClamAV integration

4. Filename Sanitization
   ├─▶ Remove special characters
   └─▶ Generate UUID prefix
```

### Authentication (Not Implemented Yet)

```
Future: Add JWT-based authentication
├─▶ Login/Register pages
├─▶ Protected routes
├─▶ User sessions
└─▶ Role-based access (admin, user)
```

---

## Performance Optimization

### Backend Optimizations

```
1. Connection Pooling
   └─▶ MySQL pool: 10 connections

2. Concurrent Processing
   └─▶ Max 5 PDFs processed simultaneously

3. Caching
   └─▶ Cache template definitions in memory

4. Batch Operations
   └─▶ Bulk INSERT for invoice_data
```

### Frontend Optimizations

```
1. Code Splitting
   └─▶ Route-based lazy loading

2. Pagination
   └─▶ Limit: 50 records per page

3. Debouncing
   └─▶ Search input debounced (500ms)

4. Memoization
   └─▶ React.memo for heavy components
```

---

## Monitoring & Logging

### Processing Logs

```
Logged Events:
├─▶ Batch created
├─▶ PDF processing started
├─▶ PDF processing completed
├─▶ PDF processing failed (with error)
├─▶ Excel generated
└─▶ Batch completed

Log Levels:
├─▶ info: Normal operations
├─▶ warning: Non-critical issues
└─▶ error: Failures and exceptions
```

### Database Queries

```
Logged in Console:
├─▶ Query execution time
├─▶ Slow queries (>1s)
└─▶ Database errors
```

---

**End of Website Workflow Documentation**
