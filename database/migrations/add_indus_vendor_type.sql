-- Migration to add 'indus' vendor type support
-- Date: November 2025

USE pdf_excel_converter;

-- Modify vendor_type ENUM in upload_batches table
ALTER TABLE upload_batches
MODIFY COLUMN vendor_type ENUM('vodafone', 'tata', 'airtel', 'indus') DEFAULT 'vodafone'
COMMENT 'Type of vendor (vodafone, tata, airtel, or indus)';

-- Modify vendor_type ENUM in pdf_records table
ALTER TABLE pdf_records
MODIFY COLUMN vendor_type ENUM('vodafone', 'tata', 'airtel', 'indus') DEFAULT 'vodafone'
COMMENT 'Type of vendor (vodafone, tata, airtel, or indus)';

-- Modify vendor_type ENUM in invoice_data table
ALTER TABLE invoice_data
MODIFY COLUMN vendor_type ENUM('vodafone', 'tata', 'airtel', 'indus') DEFAULT 'vodafone'
COMMENT 'Type of vendor (vodafone, tata, airtel, or indus)';

-- Success message
SELECT 'Migration completed: indus vendor type added successfully' AS status;
