# Database Schema Documentation

## Overview

This folder contains the complete database schema and queries for the PDF to Excel Converter application.

## Files

### **COMPLETE_DATABASE_SCHEMA_AND_QUERIES.sql** ✅ MAIN FILE
**Status**: PRODUCTION READY - Ready to paste and run

This is the **complete, consolidated database schema file** that includes:

- **Complete Schema**: All 11 tables with full structure
- **All Vendor Types**: Built-in support for 7 vendors (Vodafone, Tata, Airtel, Indus, Ascend, Sify, BSNL)
- **All Migrations Applied**: No need to run separate migration files
- **110+ Invoice Fields**: Complete invoice_data table with all extractable fields
- **Sample Queries**: Common queries for each table
- **Default Data**: Validation rules
- **Maintenance Queries**: Database cleanup and optimization queries

**Total Tables**: 11
- Core: upload_batches, pdf_records, invoice_data
- Logs: processing_logs
- Validation: validation_rules, validation_results
- Corrections: manual_corrections
- Comparison: invoice_comparisons
- Alerts: alerts
- Scheduler: scheduled_jobs
- Export: export_history

**Usage**:
```bash
# Fresh database installation
mysql -u root -p < database/COMPLETE_DATABASE_SCHEMA_AND_QUERIES.sql

# Or run directly in MySQL Workbench
# Copy and paste the entire file content
```

### **migrations/** folder
Contains incremental migration files for reference:
- `add_vendor_type.sql` - Initial vendor type support
- `add_include_blank_columns.sql` - Excel blank columns feature
- `add_airtel_vendor_type.sql` - Airtel vendor support
- `add_indus_vendor_type.sql` - Indus vendor support
- `add_all_vendor_types.sql` - All 7 vendors support (LATEST)

**Note**: If using `COMPLETE_DATABASE_SCHEMA_AND_QUERIES.sql`, you don't need to run these migrations separately.

## Database Information

- **Database Name**: `pdf_excel_converter`
- **MySQL Version**: 8.0+
- **Character Set**: utf8mb4
- **Engine**: InnoDB
- **Root Password**: Ved@1498@!!

## Quick Start

### Option 1: Fresh Installation (Recommended)
```bash
# Drop existing database (WARNING: This will delete all data!)
mysql -u root -p -e "DROP DATABASE IF EXISTS pdf_excel_converter;"

# Create fresh database with complete schema
mysql -u root -p < database/COMPLETE_DATABASE_SCHEMA_AND_QUERIES.sql
```

### Option 2: Update Existing Database
```bash
# Only if you need to add new vendor types to existing database
mysql -u root -p pdf_excel_converter < database/migrations/add_all_vendor_types.sql
```

## Database Tables Overview

### Core Tables (3)
1. **upload_batches** - Batch processing records (11 columns)
2. **pdf_records** - Individual PDF files (11 columns)
3. **invoice_data** - Extracted invoice data (110+ columns)

### Template Management (2)
4. **field_templates** - Vendor extraction templates (8 columns)
5. **custom_fields** - User-defined fields (9 columns)

### Processing & Logs (1)
6. **processing_logs** - Activity logs (7 columns)

### Validation (2)
7. **validation_rules** - Validation rules (8 columns)
8. **validation_results** - Validation results (9 columns)

### Corrections (1)
9. **manual_corrections** - Correction history (11 columns)

### Comparison (1)
10. **invoice_comparisons** - Comparison results (10 columns)

### Alerts (1)
11. **alerts** - Smart alerts (11 columns)

### Scheduler (1)
12. **scheduled_jobs** - Automated jobs (11 columns)

### Export (1)
13. **export_history** - Export history (8 columns)

## Supported Vendors

The schema includes built-in support for 7 telecom vendors:

1. ✅ Vodafone Idea Limited
2. ✅ Tata Teleservices
3. ✅ Bharti Airtel Limited
4. ✅ Indus Towers Limited
5. ✅ Ascend Telecom Infrastructure
6. ✅ Sify Technologies Limited
7. ✅ BSNL (Bharat Sanchar Nigam)

Plus "custom" vendor type for user-defined templates.

## Database Maintenance

### Regular Cleanup (Run Monthly)
```sql
-- Delete batches older than 90 days
DELETE FROM upload_batches
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Clean processing logs
DELETE FROM processing_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### Optimization (Run Quarterly)
```sql
OPTIMIZE TABLE upload_batches;
OPTIMIZE TABLE pdf_records;
OPTIMIZE TABLE invoice_data;
```

### Backup
```bash
# Full backup
mysqldump -u root -p pdf_excel_converter > backup_$(date +%Y%m%d).sql

# Compressed backup
mysqldump -u root -p pdf_excel_converter | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
mysql -u root -p pdf_excel_converter < backup_file.sql
```

## File Size

- Schema File Size: ~43 KB
- Contains: Complete CREATE TABLE statements + Sample queries + Default data
- Ready to use: Yes ✅

## Last Updated

**Date**: November 25, 2025
**Status**: Production Ready
**Version**: 2.0 (Complete Consolidated Schema)

## Notes

- All vendor types are included in the schema (no separate migrations needed)
- All advanced features (validation, corrections, comparison, alerts, scheduler) are included
- Default validation rules and Vodafone template are auto-inserted
- Foreign key constraints ensure data integrity
- Comprehensive indexes for optimal query performance

---

**For questions or issues, refer to the main project documentation in CLAUDE.md**
