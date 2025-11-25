# PDF to Excel Converter - Complete User Flow Diagram

## Application UX/UI Flow - Mind Map Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PDF TO EXCEL CONVERTER APP                          │
│                    Multi-Vendor Invoice Processing                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          MAIN NAVIGATION BAR                            │
│  [Upload] [Batches] [Templates] [Analytics] [Search] [Compare]          │
│  [Validation] [Corrections] [Scheduler] [🌙 Dark Mode] [❓ Help]       │
└─────────────────────────────────────────────────────────────────────────┘
            │         │         │         │         │         │
            │         │         │         │         │         │
    ┌───────┘    ┌────┘    ┌────┘    ┌────┘    ┌────┘    ┌────┘
    │            │         │         │         │         │
    ▼            ▼         ▼         ▼         ▼         ▼
┌─────────┐  ┌─────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐
│ UPLOAD  │  │ BATCHES │ │TEMPL │ │ANALYT│ │SEARCH│ │COMPARE │
└─────────┘  └─────────┘ └──────┘ └──────┘ └──────┘ └────────┘
```

---

## 1. UPLOAD PAGE - Bulk PDF Processing Entry Point

```
┌──────────────────────────────────────────────────────────────────────┐
│                         📤 UPLOAD PAGE                               │
│                    "Start Here" - Primary Entry                      │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   USER SELECTS PDF FILES              │
        │   • Browse files (1-1000 PDFs)        │
        │   • Drag & drop support               │
        │   • Multi-file selection              │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   CONFIGURE BATCH SETTINGS            │
        │   ┌─────────────────────────────┐     │
        │   │ 1. Batch Name               │     │
        │   │    └─ Auto: "Batch_Date"    │     │
        │   ├─────────────────────────────┤     │
        │   │ 2. Select Vendor Type       │     │
        │   │    ☑ Vodafone               │     │
        │   │    ☐ Tata                   │     │
        │   │    ☐ Airtel                 │     │
        │   │    ☐ Indus                  │     │
        │   │    ☐ Ascend                 │     │
        │   │    ☐ Sify                   │     │
        │   │    ☐ BSNL                   │     │
        │   │    ☐ Custom                 │     │
        │   ├─────────────────────────────┤     │
        │   │ 3. Processing Options       │     │
        │   │    ☐ AI Extraction (GPT-4)  │     │
        │   │    ☐ Include Blank Columns  │     │
        │   └─────────────────────────────┘     │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   CLICK "START PROCESSING"            │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   REAL-TIME PROGRESS TRACKING         │
        │   ┌─────────────────────────────┐     │
        │   │ ████████░░░░░░░░░░ 45%      │     │
        │   │ Processing: file_23.pdf     │     │
        │   │ Completed: 45/100           │     │
        │   │ Failed: 2                   │     │
        │   │ Avg Time: 3.2s per PDF      │     │
        │   └─────────────────────────────┘     │
        └───────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        ┌───────────────┐       ┌───────────────┐
        │  COMPLETED    │       │    FAILED     │
        │  View Batch → │       │  View Errors →│
        └───────────────┘       └───────────────┘
                │                       │
                └───────────┬───────────┘
                            ▼
                ┌───────────────────────┐
                │  GO TO BATCHES PAGE   │
                └───────────────────────┘
```

**User Actions**:
- Select PDFs (drag/drop or browse)
- Configure batch settings
- Start processing
- Monitor progress
- Navigate to batch details

---

## 2. BATCHES PAGE - View All Processing Batches

```
┌──────────────────────────────────────────────────────────────────────┐
│                         📊 BATCHES PAGE                              │
│                   "See All Your Batches"                             │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   FILTER & SEARCH OPTIONS             │
        │   • Filter by: Status, Vendor, Date   │
        │   • Search: Batch name                │
        │   • Sort: Date, Name, Status          │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   BATCH CARDS GRID DISPLAY                                │
        │   ┌─────────────────────────────────────────────┐         │
        │   │ 📁 Vodafone Batch - Nov 2025                │         │
        │   │ Status: ✅ Completed                        │         │
        │   │ Files: 150 processed, 2 failed              │         │
        │   │ Vendor: Vodafone Idea                       │         │
        │   │ Created: Nov 24, 2025 10:30 AM              │         │
        │   │ [View Details] [Download Excel] [Delete]    │         │
        │   └─────────────────────────────────────────────┘         │
        │                                                             │
        │   ┌─────────────────────────────────────────────┐         │
        │   │ 📁 Tata Batch - Nov 2025                    │         │
        │   │ Status: ⏳ Processing (45%)                 │         │
        │   │ Files: 67/150 processed                     │         │
        │   │ Vendor: Tata Teleservices                   │         │
        │   │ Created: Nov 25, 2025 9:15 AM               │         │
        │   │ [View Progress] [Cancel]                    │         │
        │   └─────────────────────────────────────────────┘         │
        └───────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        ┌───────────────┐       ┌───────────────┐
        │ VIEW DETAILS  │       │  QUICK EXPORT │
        └───────────────┘       └───────────────┘
                │                       │
                ▼                       ▼
        ┌───────────────┐       ┌───────────────┐
        │ Batch Details │       │  Excel/CSV    │
        │     Page      │       │   Download    │
        └───────────────┘       └───────────────┘
```

**User Actions**:
- View all batches
- Filter/search batches
- Click batch to view details
- Quick download Excel/CSV
- Delete old batches

---

## 3. BATCH DETAILS PAGE - Deep Dive Into Single Batch

```
┌──────────────────────────────────────────────────────────────────────┐
│                    📋 BATCH DETAILS PAGE                             │
│                "Vodafone Batch - Nov 2025"                           │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   BATCH SUMMARY CARDS                                     │
        │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
        │   │  Total   │ │Completed │ │  Failed  │ │  Total   │   │
        │   │  Files   │ │   Files  │ │  Files   │ │  Amount  │   │
        │   │   150    │ │   148    │ │    2     │ │ ₹2.4M    │   │
        │   └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   ACTION BUTTONS ROW                                      │
        │   [📥 Download Excel] [📄 CSV] [🔍 JSON]                 │
        │   [🔄 Retry Failed] [❌ Delete Batch]                    │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   PDF FILES TABLE                                         │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ Filename     Status   Extracted Data   Actions   │    │
        │   ├─────────────────────────────────────────────────┤    │
        │   │ invoice1.pdf   ✅     [View Data]    [Download] │    │
        │   │ invoice2.pdf   ✅     [View Data]    [Download] │    │
        │   │ invoice3.pdf   ❌     [Error: Parse] [Retry]    │    │
        │   └─────────────────────────────────────────────────┘    │
        └───────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
        ┌───────────┐ ┌──────────┐ ┌──────────┐
        │View Invoice│ │  Export  │ │  Retry   │
        │   Modal   │ │   File   │ │  Failed  │
        └───────────┘ └──────────┘ └──────────┘
                │
                ▼
        ┌───────────────────────────────────────┐
        │   INVOICE DETAILS MODAL               │
        │   ┌─────────────────────────────┐     │
        │   │ Invoice: INV-123456         │     │
        │   │ Date: Nov 1, 2025           │     │
        │   │ Vendor: Vodafone Idea       │     │
        │   │ Total: ₹15,234.50           │     │
        │   │ CGST: ₹1,234 | SGST: ₹1,234│     │
        │   │ Circuit: VF-MUM-001         │     │
        │   │ Branch: Maharashtra Region  │     │
        │   │                             │     │
        │   │ [Edit] [Correct] [Close]    │     │
        │   └─────────────────────────────┘     │
        └───────────────────────────────────────┘
```

**User Actions**:
- View batch summary
- Download in multiple formats
- Retry failed PDFs
- View individual invoice details
- Edit/correct data
- Delete batch

---

## 4. TEMPLATES PAGE - Manage Extraction Templates

```
┌──────────────────────────────────────────────────────────────────────┐
│                      📝 TEMPLATES PAGE                               │
│                "Manage Vendor Templates"                             │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   ACTION BUTTONS                      │
        │   [+ Create New Template]             │
        │   [📥 Import Template] [📤 Export]   │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   TEMPLATES TABLE                                         │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ Template Name   Vendor    Fields   Default  Action│   │
        │   ├─────────────────────────────────────────────────┤    │
        │   │ Vodafone Tmpl   Vodafone    50      ✅     [Edit]│    │
        │   │ Tata Template   Tata        48      ☐      [Edit]│    │
        │   │ Airtel ZOHO     Airtel     110      ☐      [Edit]│    │
        │   │ Custom Template Custom      35      ☐      [Edit]│    │
        │   └─────────────────────────────────────────────────┘    │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   TEMPLATE EDITOR MODAL                                   │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ Template Name: [Vodafone Template       ]       │    │
        │   │ Vendor: [Vodafone ▼]                            │    │
        │   │                                                  │    │
        │   │ Field Mappings (JSON):                          │    │
        │   │ ┌──────────────────────────────────────────┐   │    │
        │   │ │ {                                        │   │    │
        │   │ │   "invoice_number": {                   │   │    │
        │   │ │     "pattern": "Invoice:\\s*([A-Z0-9]+)"│   │    │
        │   │ │   },                                     │   │    │
        │   │ │   "bill_date": {                         │   │    │
        │   │ │     "pattern": "Date:\\s*(\\d{2}\\.\\d{2})"│  │    │
        │   │ │   }                                      │   │    │
        │   │ │ }                                        │   │    │
        │   │ └──────────────────────────────────────────┘   │    │
        │   │                                                  │    │
        │   │ ☐ Set as Default Template                       │    │
        │   │                                                  │    │
        │   │ [Save Template] [Test] [Cancel]                 │    │
        │   └─────────────────────────────────────────────────┘    │
        └───────────────────────────────────────────────────────────┘
```

**User Actions**:
- Create new template
- Edit existing template
- Set default template
- Import/export templates
- Test template with sample PDF

---

## 5. ANALYTICS DASHBOARD - Insights & Reports

```
┌──────────────────────────────────────────────────────────────────────┐
│                    📊 ANALYTICS DASHBOARD                            │
│                  "Business Intelligence"                             │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   FILTERS & DATE RANGE                │
        │   Vendor: [All ▼] | Date: [Last 6M ▼] │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   KEY METRICS CARDS                                       │
        │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
        │   │  Total   │ │  Total   │ │   Avg    │ │  Total   │   │
        │   │ Invoices │ │   Cost   │ │ Invoice  │ │   GST    │   │
        │   │   1,245  │ │ ₹45.2M   │ │ ₹36,345  │ │  ₹8.1M   │   │
        │   └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   CHARTS & VISUALIZATIONS                                 │
        │   ┌───────────────────────────────────────────────┐      │
        │   │ 📈 MONTHLY COST TREND                         │      │
        │   │ ┌─────────────────────────────────────────┐  │      │
        │   │ │         Cost (₹ Millions)               │  │      │
        │   │ │ 10M │     ╱╲                            │  │      │
        │   │ │  8M │    ╱  ╲      ╱╲                   │  │      │
        │   │ │  6M │   ╱    ╲    ╱  ╲                  │  │      │
        │   │ │  4M │  ╱      ╲  ╱    ╲                 │  │      │
        │   │ │  2M │ ╱        ╲╱      ╲                │  │      │
        │   │ │     └─────────────────────────────────  │  │      │
        │   │ │      Jan  Feb  Mar  Apr  May  Jun       │  │      │
        │   │ └─────────────────────────────────────────┘  │      │
        │   └───────────────────────────────────────────────┘      │
        │                                                           │
        │   ┌───────────────────────────────────────────────┐      │
        │   │ 🥧 VENDOR BREAKDOWN (Pie Chart)               │      │
        │   │    Vodafone: 45% (₹20.3M)                    │      │
        │   │    Tata: 30% (₹13.6M)                        │      │
        │   │    Airtel: 15% (₹6.8M)                       │      │
        │   │    Others: 10% (₹4.5M)                       │      │
        │   └───────────────────────────────────────────────┘      │
        │                                                           │
        │   ┌───────────────────────────────────────────────┐      │
        │   │ 📊 TAX SUMMARY (Bar Chart)                    │      │
        │   │    CGST: ₹4.1M ████████████████              │      │
        │   │    SGST: ₹4.0M ███████████████               │      │
        │   │    IGST: ₹2.1M ████████                      │      │
        │   └───────────────────────────────────────────────┘      │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   EXPORT REPORTS                      │
        │   [📥 Download PDF] [📊 Excel Report] │
        └───────────────────────────────────────┘
```

**User Actions**:
- Filter by vendor/date
- View cost trends
- Analyze vendor spending
- Review tax summaries
- Export reports

---

## 6. SEARCH PAGE - Advanced Invoice Search

```
┌──────────────────────────────────────────────────────────────────────┐
│                         🔍 SEARCH PAGE                               │
│                  "Find Any Invoice Quickly"                          │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   SEARCH FORM                                             │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ Search Query: [invoice number, vendor...]       │    │
        │   │                                                  │    │
        │   │ Filters:                                         │    │
        │   │ ├─ Vendor: [All Vendors ▼]                      │    │
        │   │ ├─ Date Range: [Start] to [End]                 │    │
        │   │ ├─ Amount Range: [Min ₹] to [Max ₹]            │    │
        │   │ ├─ Circuit ID: [Optional]                       │    │
        │   │ └─ Branch: [All Branches ▼]                     │    │
        │   │                                                  │    │
        │   │ [🔍 Search] [Clear] [💾 Save Query]             │    │
        │   └─────────────────────────────────────────────────┘    │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   SEARCH RESULTS TABLE                                    │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ Invoice# │ Date │ Vendor │ Amount │ Actions     │    │
        │   ├─────────────────────────────────────────────────┤    │
        │   │ INV-123  │ 11/1 │ Vodaf. │ ₹15,234│ [View][Edit]│    │
        │   │ INV-124  │ 11/2 │ Tata   │ ₹22,456│ [View][Edit]│    │
        │   │ INV-125  │ 11/3 │ Airtel │ ₹18,900│ [View][Edit]│    │
        │   └─────────────────────────────────────────────────┘    │
        │                                                           │
        │   [☑ Select All] [📥 Export Selected]                   │
        └───────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        ┌───────────────┐       ┌───────────────┐
        │  View Details │       │Export Results │
        └───────────────┘       └───────────────┘
```

**User Actions**:
- Enter search query
- Apply filters (vendor, date, amount)
- View search results
- Select invoices
- Export results
- Save search query for reuse

---

## 7. COMPARISON PAGE - Compare Multiple Invoices

```
┌──────────────────────────────────────────────────────────────────────┐
│                      ⚖️ COMPARISON PAGE                              │
│                "Side-by-Side Invoice Analysis"                       │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   SELECT INVOICES TO COMPARE          │
        │   [Search Invoice 1...] [+]           │
        │   [Search Invoice 2...] [+]           │
        │   [Search Invoice 3...] [+]           │
        │   (Max 4 invoices)                    │
        │                                       │
        │   [🔍 Compare Selected]               │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   COMPARISON TABLE                                        │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ Field      │ Invoice 1 │ Invoice 2 │ Invoice 3  │    │
        │   ├─────────────────────────────────────────────────┤    │
        │   │ Invoice #  │ INV-123   │ INV-124   │ INV-125    │    │
        │   │ Date       │ Nov 1     │ Nov 2     │ Nov 3      │    │
        │   │ Vendor     │ Vodafone  │ Vodafone  │ Vodafone   │    │
        │   │ Total      │ ₹15,234 ⚠│ ₹18,900   │ ₹18,950    │    │
        │   │ CGST       │ ₹1,234    │ ₹1,567    │ ₹1,570     │    │
        │   │ Circuit    │ VF-MUM-01 │ VF-MUM-01 │ VF-MUM-01  │    │
        │   │ Bandwidth  │ 100 Mbps  │ 100 Mbps  │ 100 Mbps   │    │
        │   └─────────────────────────────────────────────────┘    │
        │                                                           │
        │   Legend: ⚠ = Significant difference detected            │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   INSIGHTS & ALERTS                   │
        │   ⚠ Invoice 1 cost is 19% lower      │
        │   ℹ Same circuit, different dates     │
        │   ✅ All GST rates match              │
        │                                       │
        │   [📥 Export Comparison]              │
        └───────────────────────────────────────┘
```

**User Actions**:
- Select 2-4 invoices
- Compare side-by-side
- Spot differences
- View insights
- Export comparison

---

## 8. VALIDATION PAGE - Data Quality Checks

```
┌──────────────────────────────────────────────────────────────────────┐
│                      ✅ VALIDATION PAGE                              │
│                   "Data Quality Control"                             │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   SELECT BATCH TO VALIDATE            │
        │   Batch: [Vodafone Nov 2025 ▼]       │
        │   [🔍 Run Validation]                 │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   VALIDATION SUMMARY                                      │
        │   ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
        │   │  Total   │ │  Errors  │ │ Warnings │                 │
        │   │  Checks  │ │   12     │ │    8     │                 │
        │   │   150    │ │   ❌     │ │   ⚠️     │                 │
        │   └──────────┘ └──────────┘ └──────────┘                 │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   VALIDATION ERRORS TABLE                                 │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ File    │ Field  │ Error      │ Value │ Action  │    │
        │   ├─────────────────────────────────────────────────┤    │
        │   │ inv1.pdf│ Total  │ Required   │ NULL  │ [Fix]   │    │
        │   │ inv2.pdf│ GSTIN  │ Invalid    │ ABC   │ [Fix]   │    │
        │   │ inv3.pdf│ Date   │ Invalid    │ 32/13 │ [Fix]   │    │
        │   └─────────────────────────────────────────────────┘    │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   QUICK FIX MODAL                     │
        │   ┌─────────────────────────────┐     │
        │   │ Invoice: inv1.pdf           │     │
        │   │ Field: Total Amount         │     │
        │   │ Error: Missing value        │     │
        │   │                             │     │
        │   │ Suggested: ₹15,234.50       │     │
        │   │ Or enter: [_______]         │     │
        │   │                             │     │
        │   │ [Apply] [Skip] [Cancel]     │     │
        │   └─────────────────────────────┘     │
        └───────────────────────────────────────┘
```

**User Actions**:
- Select batch
- Run validation
- View errors/warnings
- Fix errors inline
- Re-validate

---

## 9. CORRECTIONS PAGE - Manual Data Corrections

```
┌──────────────────────────────────────────────────────────────────────┐
│                      ✏️ CORRECTIONS PAGE                             │
│                  "Fix Extraction Errors"                             │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   SEARCH INVOICE TO CORRECT           │
        │   [Search by invoice #, vendor...]    │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   INVOICE EDITOR FORM                                     │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ Invoice: INV-123456                             │    │
        │   │                                                  │    │
        │   │ Basic Details:                                   │    │
        │   │ ├─ Invoice Number: [INV-123456    ]             │    │
        │   │ ├─ Bill Date:      [2025-11-01 📅]              │    │
        │   │ ├─ Due Date:       [2025-11-15 📅]              │    │
        │   │ └─ Vendor:         [Vodafone ▼]                 │    │
        │   │                                                  │    │
        │   │ Financial:                                       │    │
        │   │ ├─ Sub Total:      [₹ 13,000.00]                │    │
        │   │ ├─ CGST:           [₹  1,170.00]                │    │
        │   │ ├─ SGST:           [₹  1,170.00]                │    │
        │   │ └─ Total:          [₹ 15,340.00]                │    │
        │   │                                                  │    │
        │   │ Service Details:                                 │    │
        │   │ ├─ Circuit ID:     [VF-MUM-001]                 │    │
        │   │ ├─ Bandwidth:      [100 Mbps]                   │    │
        │   │ └─ Branch:         [Maharashtra ▼]              │    │
        │   │                                                  │    │
        │   │ Reason: [Wrong total extracted from PDF]        │    │
        │   │                                                  │    │
        │   │ [💾 Save Corrections] [↩️ Revert] [❌ Cancel]   │    │
        │   └─────────────────────────────────────────────────┘    │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   CORRECTION HISTORY                  │
        │   ┌─────────────────────────────┐     │
        │   │ Date      │ Field │ By      │     │
        │   │ Nov 24    │ Total │ Admin   │     │
        │   │ Nov 23    │ GSTIN │ User1   │     │
        │   └─────────────────────────────┘     │
        └───────────────────────────────────────┘
```

**User Actions**:
- Search invoice
- Edit any field
- Enter correction reason
- Save corrections
- View correction history

---

## 10. SCHEDULER PAGE - Automate Recurring Tasks

```
┌──────────────────────────────────────────────────────────────────────┐
│                      ⏰ SCHEDULER PAGE                               │
│                 "Automate Your Workflows"                            │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   ACTION BUTTONS                      │
        │   [+ Create New Job]                  │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   SCHEDULED JOBS TABLE                                    │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ Job Name │ Type │ Schedule │ Status │ Actions    │    │
        │   ├─────────────────────────────────────────────────┤    │
        │   │ Daily Vod│ Batch│ Daily 9AM│ Active │ [Edit][❌]│    │
        │   │ Weekly Rpt│Report│ Mon 10AM│ Active │ [Edit][❌]│    │
        │   │ Cloud Sync│ Sync│ Every 6Hr│ Paused │ [Edit][❌]│    │
        │   └─────────────────────────────────────────────────┘    │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   CREATE JOB MODAL                                        │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │ Job Name: [Daily Vodafone Processing]           │    │
        │   │                                                  │    │
        │   │ Job Type: [Batch Processing ▼]                  │    │
        │   │                                                  │    │
        │   │ Schedule (Cron):                                 │    │
        │   │ ┌───────────────────────────────────────────┐  │    │
        │   │ │ ☐ Daily   at [09:00 AM]                   │  │    │
        │   │ │ ☐ Weekly  on [Mon ▼] at [10:00 AM]        │  │    │
        │   │ │ ☐ Monthly on [1st ▼] at [12:00 PM]        │  │    │
        │   │ │ ☑ Custom: [0 9 * * *]                     │  │    │
        │   │ └───────────────────────────────────────────┘  │    │
        │   │                                                  │    │
        │   │ Configuration:                                   │    │
        │   │ ├─ Folder: [/uploads/daily/]                    │    │
        │   │ ├─ Vendor: [Vodafone ▼]                         │    │
        │   │ └─ Auto-export: ☑ Excel                         │    │
        │   │                                                  │    │
        │   │ [💾 Create Job] [❌ Cancel]                     │    │
        │   └─────────────────────────────────────────────────┘    │
        └───────────────────────────────────────────────────────────┘
```

**User Actions**:
- Create scheduled job
- Configure schedule (cron)
- Set job parameters
- Pause/resume jobs
- Delete jobs
- View job history

---

## 11. HELP PAGE - Interactive User Guide (NEW FEATURE)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ❓ HELP & GUIDE PAGE                         │
│                    "How to Use This App"                             │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   NAVIGATION TABS                                         │
        │   [📖 Getting Started] [🗺️ App Flow] [💡 Tips] [📞 Support]│
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   🗺️ INTERACTIVE APP FLOW DIAGRAM                         │
        │                                                           │
        │   Click any box to learn more about that feature          │
        │                                                           │
        │   ┌─────────────────────────────────────────────────┐    │
        │   │          START: Upload Your PDFs                │    │
        │   │       ┌────────────────────────────┐            │    │
        │   │       │ 1️⃣ UPLOAD PAGE            │ ←Click    │    │
        │   │       │ • Select PDFs (1-1000)     │            │    │
        │   │       │ • Choose vendor type       │            │    │
        │   │       │ • Start processing         │            │    │
        │   │       └────────────────────────────┘            │    │
        │   │                  │                               │    │
        │   │                  ↓                               │    │
        │   │       ┌────────────────────────────┐            │    │
        │   │       │ 2️⃣ BATCHES PAGE           │            │    │
        │   │       │ • View all batches         │            │    │
        │   │       │ • Monitor progress         │            │    │
        │   │       │ • Quick export             │            │    │
        │   │       └────────────────────────────┘            │    │
        │   │                  │                               │    │
        │   │        ┌─────────┼─────────┐                    │    │
        │   │        ▼         ▼         ▼                    │    │
        │   │   ┌────────┐ ┌────────┐ ┌────────┐             │    │
        │   │   │3️⃣ ANAL│ │4️⃣ SRCH│ │5️⃣ COMP│             │    │
        │   │   │ YTICS  │ │        │ │ ARE    │             │    │
        │   │   └────────┘ └────────┘ └────────┘             │    │
        │   │        │         │         │                    │    │
        │   │        └─────────┼─────────┘                    │    │
        │   │                  ▼                               │    │
        │   │       ┌────────────────────────────┐            │    │
        │   │       │ 6️⃣ VALIDATE & CORRECT     │            │    │
        │   │       │ • Check data quality       │            │    │
        │   │       │ • Fix errors               │            │    │
        │   │       └────────────────────────────┘            │    │
        │   │                  │                               │    │
        │   │                  ↓                               │    │
        │   │       ┌────────────────────────────┐            │    │
        │   │       │ 7️⃣ EXPORT & SCHEDULE      │            │    │
        │   │       │ • Download Excel/CSV       │            │    │
        │   │       │ • Automate workflows       │            │    │
        │   │       └────────────────────────────┘            │    │
        │   └─────────────────────────────────────────────────┘    │
        └───────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────────────┐
        │   QUICK TIPS SECTION                                      │
        │   💡 Tip 1: Always select correct vendor type             │
        │   💡 Tip 2: Use validation before exporting               │
        │   💡 Tip 3: Save templates for recurring vendors          │
        │   💡 Tip 4: Schedule jobs for regular processing          │
        └───────────────────────────────────────────────────────────┘
```

**Help Page Features**:
- Interactive flow diagram
- Click boxes to see details
- Getting started guide
- Tips & tricks
- FAQ section
- Contact support

---

## COMPLETE USER JOURNEY FLOW

```
START
  │
  ├──→ 1. UPLOAD PDFs
  │       │
  │       ├─→ Select files (1-1000)
  │       ├─→ Choose vendor (Vodafone/Tata/Airtel/etc)
  │       ├─→ Configure settings
  │       └─→ Start processing
  │
  ↓
  ├──→ 2. MONITOR PROGRESS (Batches Page)
  │       │
  │       ├─→ View real-time progress
  │       ├─→ Check for errors
  │       └─→ Click batch for details
  │
  ↓
  ├──→ 3. VIEW BATCH DETAILS
  │       │
  │       ├─→ See all PDFs
  │       ├─→ View extracted data
  │       ├─→ Retry failed files
  │       └─→ Quick export options
  │
  ↓
  ├──→ 4. VALIDATE DATA (Optional)
  │       │
  │       ├─→ Run validation checks
  │       ├─→ View errors/warnings
  │       └─→ Fix issues
  │
  ↓
  ├──→ 5. CORRECT ERRORS (If needed)
  │       │
  │       ├─→ Search invoice
  │       ├─→ Edit fields
  │       └─→ Save corrections
  │
  ↓
  ├──→ 6. ANALYZE DATA (Optional)
  │       │
  │       ├─→ View analytics dashboard
  │       ├─→ Check vendor breakdown
  │       ├─→ Review cost trends
  │       └─→ Export reports
  │
  ↓
  ├──→ 7. SEARCH & COMPARE (Optional)
  │       │
  │       ├─→ Search invoices
  │       ├─→ Compare 2-4 invoices
  │       └─→ Spot differences
  │
  ↓
  ├──→ 8. EXPORT RESULTS
  │       │
  │       ├─→ Download Excel
  │       ├─→ Download CSV
  │       └─→ Download JSON
  │
  ↓
  └──→ 9. AUTOMATE (Optional)
          │
          ├─→ Create scheduled jobs
          ├─→ Set up recurring processing
          └─→ Configure auto-exports

END
```

---

## KEY USER INTERACTIONS SUMMARY

### Primary Flow (Most Common):
1. Upload → 2. Monitor → 3. Export
   - Time: ~5-10 minutes (for 100 PDFs)

### Data Quality Flow:
1. Upload → 2. Validate → 3. Correct → 4. Export
   - Time: ~15-30 minutes (with manual corrections)

### Analysis Flow:
1. Upload → 2. Analytics → 3. Search/Compare → 4. Export
   - Time: ~10-20 minutes (for insights)

### Automation Flow:
1. Setup Templates → 2. Create Schedule → 3. Monitor Jobs
   - Time: One-time 30-60 minute setup

---

## NAVIGATION HIERARCHY

```
Main Navigation Bar (Always Visible)
├─ Upload (Primary CTA)
├─ Batches (Most accessed)
├─ Templates (Setup)
├─ Analytics (Insights)
├─ Search (Find data)
├─ Compare (Analysis)
├─ Validation (Quality)
├─ Corrections (Fix errors)
├─ Scheduler (Automation)
├─ Dark Mode Toggle (UI preference)
└─ Help (❓ NEW - This guide!)
```

---

## COLOR CODING FOR FLOW DIAGRAM

- 🟦 **Blue**: Core Features (Upload, Batches, Export)
- 🟩 **Green**: Success/Completed Actions
- 🟨 **Yellow**: In Progress/Processing
- 🟥 **Red**: Errors/Failed Items
- 🟪 **Purple**: Advanced Features (Analytics, Scheduler)
- ⚪ **Gray**: Optional/Secondary Features

---

**END OF USER FLOW DIAGRAM**
**This document will be embedded in the Help page as an interactive guide**
