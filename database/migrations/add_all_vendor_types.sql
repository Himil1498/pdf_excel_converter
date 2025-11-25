-- Migration: Add all 7 vendor types to database
-- Date: November 24, 2025
-- Purpose: Support Vodafone, Tata, Airtel, Indus, Ascend, Sify, BSNL

USE pdf_excel_converter;

-- Update upload_batches table vendor_type enum
ALTER TABLE upload_batches
MODIFY COLUMN vendor_type ENUM('vodafone', 'tata', 'airtel', 'indus', 'ascend', 'sify', 'bsnl', 'custom') DEFAULT 'vodafone';

-- Update pdf_records table vendor_type enum
ALTER TABLE pdf_records
MODIFY COLUMN vendor_type ENUM('vodafone', 'tata', 'airtel', 'indus', 'ascend', 'sify', 'bsnl', 'custom') DEFAULT NULL;

-- Update invoice_data table vendor_type enum
ALTER TABLE invoice_data
MODIFY COLUMN vendor_type ENUM('vodafone', 'tata', 'airtel', 'indus', 'ascend', 'sify', 'bsnl', 'custom') DEFAULT NULL;

-- Verify changes
SELECT
    'upload_batches' as table_name,
    COLUMN_NAME,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'pdf_excel_converter'
    AND TABLE_NAME = 'upload_batches'
    AND COLUMN_NAME = 'vendor_type'
UNION ALL
SELECT
    'pdf_records' as table_name,
    COLUMN_NAME,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'pdf_excel_converter'
    AND TABLE_NAME = 'pdf_records'
    AND COLUMN_NAME = 'vendor_type'
UNION ALL
SELECT
    'invoice_data' as table_name,
    COLUMN_NAME,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'pdf_excel_converter'
    AND TABLE_NAME = 'invoice_data'
    AND COLUMN_NAME = 'vendor_type';

SELECT 'Migration completed successfully!' as status;
