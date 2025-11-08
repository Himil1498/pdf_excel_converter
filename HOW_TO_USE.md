# 📖 How to Use Your PDF to Excel Converter

## 🚀 Quick Start

### 1. Launch the App
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open: **http://localhost:5173**

---

## 💡 Basic Workflow

### Step 1: Upload PDFs
1. Click **"Upload"** in header
2. Select multiple Vodafone PDF invoices
3. Enter batch name (e.g., "Nov 2025 Invoices")
4. Click **"Upload & Process"**

### Step 2: Monitor Processing
1. Go to **"Batches"** page
2. See real-time progress
3. Wait for status: **"Completed"**

### Step 3: Validate Data
1. Click on batch → Opens batch details
2. Click **"Validation"** button (Blue)
3. Review any errors or warnings
4. Check for missing fields, duplicates, format issues

### Step 4: Fix Errors (if needed)
1. From batch details, click **"Corrections"** button (Purple)
2. Select invoice from left panel
3. Click edit icon on any field
4. Enter correct value → Click checkmark
5. Click **"Apply All Corrections"** when done

### Step 5: Export Results
Choose format from batch details:
- **Excel** (Green button) - For viewing
- **CSV** (Blue button) - For accounting software
- **JSON** (Purple button) - For system integration

---

## 🔍 Advanced Features

### Search Invoices
1. Go to **"Search"** page
2. Enter: circuit ID, bill number, or customer name
3. Filter by date range or amount
4. Export filtered results

### View Analytics
1. Go to **"Analytics"** page
2. See:
   - Total costs & trends
   - Circuit-wise breakdown
   - Vendor comparisons
   - Monthly spending charts

### Compare Invoices
1. Go to **"Compare"** page
2. Search for an invoice
3. Select it to see:
   - Month-over-month changes
   - Circuit cost history
   - Price change alerts

### Schedule Auto-Processing
1. Go to **"Scheduler"** page
2. Click **"Create Job"**
3. Set:
   - Job name
   - Schedule (daily/weekly/monthly)
   - Source folder path
4. Click **"Create Job"**

### View Alerts
1. Click **Bell icon** in header
2. See notifications for:
   - Cost spikes
   - Missing data
   - Duplicate invoices
   - Payment due dates

---

## 📊 Understanding Your Data

### Batch Details Page Shows:
- **Total Files** - PDFs uploaded
- **Processed** - Successfully extracted
- **Failed** - Errors during processing
- **Progress** - % completion

### Color Codes:
- 🟢 **Green** - Successful/Passed
- 🔴 **Red** - Error/Failed
- 🟠 **Orange** - Warning/Needs attention
- 🔵 **Blue** - Info/In progress

---

## ⚡ Pro Tips

1. **Batch Naming**: Use date format like "2025-11-Vodafone" for easy tracking

2. **Validation First**: Always check validation before exporting

3. **Save Corrections**: Applied corrections improve future extractions

4. **Use Search**: Faster than browsing batches for old invoices

5. **Export CSV**: Best for importing to Tally/QuickBooks

6. **Check Alerts Daily**: Stay on top of cost anomalies

7. **Schedule Night Jobs**: Process large batches during off-hours

---

## 🆘 Troubleshooting

**Upload Fails?**
- Check file size (<10MB each)
- Ensure PDFs are not password protected
- Max 1000 files per batch

**Processing Stuck?**
- Refresh page
- Check batch details for error logs
- Retry failed files with "Retry" button

**Validation Errors?**
- Go to Corrections page
- Fix highlighted fields
- Re-export after corrections

**Missing Data?**
- Some PDFs may have different formats
- Use manual correction to fill in
- Report pattern to improve parser

---

## 📱 Mobile Use

- All pages work on mobile
- Best for viewing data
- Use desktop for bulk uploads

---

## 🎯 Common Tasks

### Monthly Invoice Processing:
1. Upload → 2. Validate → 3. Correct → 4. Export CSV → 5. Import to accounting software

### Cost Tracking:
1. Analytics page → 2. View trends → 3. Compare → 4. Set up alerts

### Audit/Report Generation:
1. Search date range → 2. Export filtered JSON → 3. Generate reports

---

## 📞 Need Help?

- Check validation messages for specific errors
- Review processing logs in batch details
- All features have tooltips (hover for info)

**That's it! Start processing invoices faster and smarter! 🚀**
