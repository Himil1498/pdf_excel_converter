# 🧪 PDF to Excel Converter - TESTING GUIDE

## 📋 What We Built - Feature Summary

### ✅ **Phase 1: Critical UI Components**
1. Template Creation/Edit Modal - Manage PDF extraction templates
2. Custom Field Creation/Edit Modal - Add custom columns to Excel
3. Full CRUD operations for templates and fields

### ✅ **Phase 2: Enhanced Error Handling**
4. Retry Failed Batch - Retry all failed files with one click
5. Retry Single File - Reprocess individual files
6. Retry buttons in batch details page

### ✅ **Phase 3: Additional Features**
7. Duplicate File Detection - Prevents uploading same file twice
8. Batch Name Validation - 3-100 characters, uniqueness check
9. CSV Export - Export data to CSV format
10. JSON Export - Export data to JSON format
11. Error Report Download - Download list of failed files
12. Enhanced PDF Validation - Extension check + security validation
13. Pagination for Batches - 20 items per page
14. Search Batches - Search by batch name
15. Filter by Status - Filter batches by status

---

## 🧪 TESTING CHECKLIST

### **1. UPLOAD & PROCESSING**

#### Test 1.1: Basic Upload ✅
- [ ] Go to Upload page
- [ ] Enter batch name: "Test Batch 1"
- [ ] Upload 3-5 PDF files
- [ ] Click "Upload and Process"
- [ ] **Expected:** Success message, redirected to batch details

#### Test 1.2: Duplicate Detection ✅
- [ ] Try uploading same files again
- [ ] **Expected:** Warning "X duplicate file(s) skipped"

#### Test 1.3: File Validation ✅
- [ ] Try upload .txt file
- [ ] **Expected:** Error "Only PDF files are allowed"

#### Test 1.4: Batch Name Validation ✅
- [ ] Try empty name → Error
- [ ] Try 2 characters → Error "Must be at least 3 characters"
- [ ] Try existing name → Error "Batch name already exists"
- [ ] Try valid name → Success

---

### **2. BATCH MANAGEMENT**

#### Test 2.1: View Batches ✅
- [ ] Navigate to Batches page
- [ ] **Expected:** List shows:
  - Batch name, status badge
  - File counts (total/processed/failed)
  - Progress bar
  - Created date
  - Action buttons

#### Test 2.2: Search ✅
- [ ] Type batch name in search box
- [ ] **Expected:** Filtered results

#### Test 2.3: Filter by Status ✅
- [ ] Select "Completed" from dropdown
- [ ] **Expected:** Only completed batches shown

#### Test 2.4: Pagination ✅
- [ ] If 20+ batches exist, check pagination
- [ ] Click Next/Previous buttons
- [ ] **Expected:** Shows 20 items per page
- [ ] **Expected:** Page counter updates

---

### **3. BATCH DETAILS**

#### Test 3.1: View Details ✅
- [ ] Click eye icon on any batch
- [ ] **Expected:** Shows:
  - 4 status cards
  - Progress bar
  - File list with status
  - Processing time

#### Test 3.2: Auto-Refresh ✅
- [ ] Check refresh icon spinning during processing
- [ ] Click to toggle off
- [ ] **Expected:** No more auto-updates

---

### **4. DOWNLOAD & EXPORT**

#### Test 4.1: Excel Download ✅
- [ ] On completed batch, click "Excel" button
- [ ] Open file
- [ ] **Expected:** Structured invoice data

#### Test 4.2: CSV Download ✅
- [ ] Click "CSV" button
- [ ] Open in Excel
- [ ] **Expected:** Comma-separated data with headers

#### Test 4.3: JSON Download ✅
- [ ] Click "JSON" button
- [ ] Open in text editor
- [ ] **Expected:** Valid JSON with batch info

#### Test 4.4: Error Report ✅
- [ ] On batch with failed files, click "Errors" button
- [ ] **Expected:** CSV with failed files list

---

### **5. RETRY FUNCTIONALITY**

#### Test 5.1: Retry Batch ✅
- [ ] On batch with failures, click "Retry Failed (X)"
- [ ] **Expected:** Files reset to pending, reprocessing starts

#### Test 5.2: Retry Single File ✅
- [ ] Find failed file in batch details
- [ ] Click "Retry" button next to it
- [ ] **Expected:** Single file reprocesses

---

### **6. TEMPLATE MANAGEMENT**

#### Test 6.1: Create Template ✅
- [ ] Go to Templates page
- [ ] Click "New Template"
- [ ] Fill in:
  - Template Name: "Test Template"
  - Vendor Name: "Vodafone Idea"
  - Add 2-3 field mappings with regex
  - Check "Set as default"
- [ ] Click "Create Template"
- [ ] **Expected:** Success, template appears in list

#### Test 6.2: Edit Template ✅
- [ ] Click edit icon on template
- [ ] Modify name/fields
- [ ] Click "Update Template"
- [ ] **Expected:** Changes saved

#### Test 6.3: Delete Template ✅
- [ ] Click delete icon
- [ ] Confirm
- [ ] **Expected:** Template removed

---

### **7. CUSTOM FIELDS**

#### Test 7.1: Create Field ✅
- [ ] Click "New Field"
- [ ] Fill in:
  - Field Name: "Customer ID"
  - Field Type: "Text"
  - Excel Column: "Customer Reference"
  - Check "Active"
- [ ] Click "Create Field"
- [ ] **Expected:** Field added

#### Test 7.2: Edit Field ✅
- [ ] Click edit icon
- [ ] Change display order
- [ ] Toggle active status
- [ ] **Expected:** Changes saved

#### Test 7.3: Delete Field ✅
- [ ] Click delete icon
- [ ] **Expected:** Field removed

---

## 🐛 ERROR SCENARIOS

### Test 8.1: Backend Offline
- [ ] Stop backend server
- [ ] Try any frontend operation
- [ ] **Expected:** Error message, no crash

### Test 8.2: Large File
- [ ] Try uploading PDF > 10MB
- [ ] **Expected:** Error "File size limit exceeded"

### Test 8.3: Max Files
- [ ] Try uploading 1001 files
- [ ] **Expected:** Error "Maximum 1000 files allowed"

---

## 📊 FEATURE CHECKLIST

### **Upload & Validation**
- [ ] Basic upload works
- [ ] Duplicate detection works
- [ ] File type validation works
- [ ] Batch name validation works
- [ ] Max file limit enforced

### **Batch Management**
- [ ] List batches with pagination
- [ ] Search functionality works
- [ ] Filter by status works
- [ ] View batch details
- [ ] Delete batch

### **Downloads**
- [ ] Excel export works
- [ ] CSV export works
- [ ] JSON export works
- [ ] Error report works

### **Retry Features**
- [ ] Retry batch works
- [ ] Retry single file works

### **Templates & Fields**
- [ ] Create/edit/delete templates
- [ ] Create/edit/delete custom fields
- [ ] Field mappings work

---

## 📝 HOW TO REPORT ISSUES

**Format:**
```
Issue: [Description]
Steps:
1. Go to X page
2. Click Y button
3. See error Z

Expected: [What should happen]
Actual: [What happened]
Browser: Chrome/Firefox/Edge
Screenshot: (if possible)
```

---

## ✅ ALL FEATURES IMPLEMENTED

**Total Features: 15+**
- ✅ Template & Custom Field Modals
- ✅ Retry Mechanism (Batch & Single File)
- ✅ Duplicate Detection
- ✅ Batch Name Validation & Uniqueness
- ✅ CSV Export
- ✅ JSON Export
- ✅ Error Report Download
- ✅ Pagination (20 per page)
- ✅ Search Batches
- ✅ Filter by Status
- ✅ Enhanced PDF Validation
- ✅ Real-time Progress Monitoring
- ✅ Auto-refresh Toggle
- ✅ Multiple Download Formats
- ✅ Comprehensive Error Handling

---

**🎯 TEST TOMORROW & REPORT ANY ISSUES!**
