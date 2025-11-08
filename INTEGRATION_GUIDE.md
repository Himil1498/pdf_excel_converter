# Integration Guide - New Features

## Step 1: Run Database Migration

```bash
# Navigate to project directory
cd C:\Users\hkcha\OneDrive\Desktop\PDF_EXCEL_CONVERT_APP

# Login to MySQL
mysql -u root -p

# Run migration
mysql -u root -p pdf_excel_converter < database/migration_add_new_fields.sql

# Verify tables were created
mysql -u root -p -e "USE pdf_excel_converter; SHOW TABLES;"
```

Expected output should include these new tables:
- `validation_rules`
- `validation_results`
- `invoice_comparisons`
- `alerts`
- `scheduled_jobs`
- `manual_corrections`
- `export_history`

## Step 2: Update Backend Server Configuration

Add these lines to `backend/server.js` after the existing route imports:

```javascript
// ===== ADD THESE NEW ROUTE IMPORTS =====
const validationRoutes = require('./routes/validation');
const analyticsRoutes = require('./routes/analytics');
const searchRoutes = require('./routes/search');
const comparisonRoutes = require('./routes/comparison');
const alertsRoutes = require('./routes/alerts');
const exportRoutes = require('./routes/export');

// ===== ADD THESE ROUTE CONFIGURATIONS =====
// (Add these after existing app.use routes)

// Validation routes
app.use('/api/validation', validationRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Search routes
app.use('/api/search', searchRoutes);

// Comparison routes
app.use('/api/compare', comparisonRoutes);

// Alerts routes
app.use('/api/alerts', alertsRoutes);

// Export routes
app.use('/api/export', exportRoutes);
```

## Step 3: Install Any Missing Dependencies

```bash
cd backend
npm install
```

All required dependencies should already be in package.json. If not, the services will notify you.

## Step 4: Restart Backend Server

```bash
cd backend
npm run dev
```

Or use START.bat if available.

## Step 5: Test API Endpoints

### Test Validation API

```bash
# Get validation results for batch
curl http://localhost:5000/api/validation/batches/1/validation

# Get validation summary
curl http://localhost:5000/api/validation/batches/1/validation/summary
```

### Test Analytics API

```bash
# Get dashboard stats
curl http://localhost:5000/api/analytics/dashboard

# Get cost analytics
curl http://localhost:5000/api/analytics/costs

# Get monthly trends
curl http://localhost:5000/api/analytics/trends
```

### Test Search API

```bash
# Get filter options
curl http://localhost:5000/api/search/filters

# Full-text search
curl http://localhost:5000/api/search/fulltext?q=vodafone

# Search by circuit
curl http://localhost:5000/api/search/circuit/ENT31PUNPUN148732
```

### Test Comparison API

```bash
# Compare invoice with previous
curl http://localhost:5000/api/compare/invoice/1

# Get significant changes
curl http://localhost:5000/api/compare/significant-changes
```

### Test Alerts API

```bash
# Get unread alerts
curl http://localhost:5000/api/alerts/unread

# Get critical alerts
curl http://localhost:5000/api/alerts/critical

# Generate alerts for batch
curl -X POST http://localhost:5000/api/alerts/batch/1/generate
```

### Test Export API

```bash
# Export to Excel
curl http://localhost:5000/api/export/excel/1 --output batch1.xlsx

# Export to CSV
curl http://localhost:5000/api/export/csv/1 --output batch1.csv

# Export to JSON
curl http://localhost:5000/api/export/json/1 --output batch1.json
```

## Step 6: Verify Enhanced PDF Parsing

Process a new batch and check that the new fields are being extracted:

1. Upload PDFs through the UI
2. After processing, check the database:

```sql
USE pdf_excel_converter;

-- Check if new fields are populated
SELECT
  bill_number,
  invoice_ref_no,
  previous_outstanding,
  service_period_from,
  service_period_to,
  cgst_amount,
  sgst_amount,
  vendor_email,
  bank_name,
  ifsc_code
FROM invoice_data
ORDER BY created_at DESC
LIMIT 5;
```

## Step 7: Frontend Integration (Next Steps)

Create new frontend pages/components:

### 1. Analytics Dashboard Page
Location: `frontend/src/pages/AnalyticsDashboard.jsx`

Features to implement:
- Cost trends chart
- Circuit breakdown table
- Vendor comparison
- Top spending circuits
- Monthly statistics

### 2. Search & Filter Page
Location: `frontend/src/pages/SearchPage.jsx`

Features to implement:
- Advanced search form with all filters
- Results table with pagination
- Export buttons
- Quick filters

### 3. Validation Results Display
Location: Update `frontend/src/pages/BatchDetailsPage.jsx`

Add:
- Validation summary cards
- Error/warning badges
- Validation results table
- Fix suggestions display

### 4. Alerts Notification System
Location: `frontend/src/components/AlertsNotification.jsx`

Add:
- Alert badge in header
- Dropdown for recent alerts
- Alert severity icons
- Mark as read/dismiss actions

### 5. Comparison View
Location: `frontend/src/pages/ComparisonPage.jsx`

Add:
- Invoice comparison table
- Change indicators (up/down arrows)
- Percentage change badges
- Trend charts

### 6. Export Options
Location: Update `frontend/src/pages/BatchDetailsPage.jsx`

Add buttons for:
- Export to Excel
- Export to CSV
- Export to JSON
- View export history

## API Endpoints Summary

### Validation
- GET `/api/validation/batches/:batchId/validation`
- GET `/api/validation/batches/:batchId/validation/summary`
- POST `/api/validation/check-duplicates`

### Analytics
- GET `/api/analytics/dashboard`
- GET `/api/analytics/costs`
- GET `/api/analytics/circuits`
- GET `/api/analytics/vendors`
- GET `/api/analytics/trends`
- GET `/api/analytics/bandwidth`
- GET `/api/analytics/top-spending`
- GET `/api/analytics/payment-due`

### Search
- POST `/api/search`
- GET `/api/search/fulltext?q=<term>`
- GET `/api/search/circuit/:circuitId`
- GET `/api/search/relationship/:number`
- GET `/api/search/filters`
- GET `/api/search/recent`
- GET `/api/search/amount?min=<min>&max=<max>`
- GET `/api/search/due-date?startDate=<date>&endDate=<date>`

### Comparison
- GET `/api/compare/invoice/:invoiceId`
- GET `/api/compare/circuit/:circuitId/history`
- GET `/api/compare/significant-changes`
- POST `/api/compare/circuits` (body: { circuitIds: [] })

### Alerts
- GET `/api/alerts/batch/:batchId`
- POST `/api/alerts/batch/:batchId/generate`
- GET `/api/alerts/unread`
- GET `/api/alerts/critical`
- GET `/api/alerts/stats`
- PUT `/api/alerts/:alertId/read`
- PUT `/api/alerts/:alertId/dismiss`
- DELETE `/api/alerts/cleanup?days=<days>`

### Export
- GET `/api/export/excel/:batchId`
- GET `/api/export/csv/:batchId`
- GET `/api/export/json/:batchId`
- GET `/api/export/history/:batchId`

## Troubleshooting

### Database Connection Errors
```bash
# Check MySQL service
net start MySQL80

# Verify connection
mysql -u root -p -e "SELECT 1;"
```

### Missing Tables Error
```bash
# Re-run migration
mysql -u root -p pdf_excel_converter < database/migration_add_new_fields.sql
```

### Route Not Found (404)
- Verify routes are added to server.js
- Check route path spelling
- Restart the backend server

### Validation Not Running
- Check if validation_rules table has data
- Run: `SELECT * FROM validation_rules;`
- If empty, re-run migration script

### Export Files Not Generating
- Check UPLOAD_DIR in .env file
- Verify directory exists and has write permissions
- Check disk space

## Next Development Tasks

1. **Frontend UI Components** - Create React components for new features
2. **Charts & Visualizations** - Add Chart.js or Recharts for analytics
3. **Real-time Updates** - Implement WebSocket for live alerts
4. **User Authentication** - Add login system for production
5. **API Documentation** - Generate Swagger/OpenAPI docs
6. **Testing** - Write unit and integration tests
7. **Performance** - Add caching layer for analytics
8. **Mobile Optimization** - Enhance responsive design

## Production Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run successfully
- [ ] All API endpoints tested
- [ ] Frontend components integrated
- [ ] Error logging configured
- [ ] HTTPS enabled
- [ ] Authentication added
- [ ] Rate limiting configured
- [ ] Backups scheduled
- [ ] Monitoring tools setup

---

**All backend services are now ready! Proceed with frontend integration.**
