-- Migration to add vendor_type field to support multiple vendors (Vodafone and Tata)

USE pdf_excel_converter;

-- Add vendor_type to upload_batches table
ALTER TABLE upload_batches
ADD COLUMN vendor_type ENUM('vodafone', 'tata') DEFAULT 'vodafone'
COMMENT 'Type of vendor (vodafone or tata)' AFTER batch_name;

-- Add vendor_type to pdf_records table for tracking
ALTER TABLE pdf_records
ADD COLUMN vendor_type ENUM('vodafone', 'tata') DEFAULT 'vodafone'
COMMENT 'Type of vendor (vodafone or tata)' AFTER batch_id;

-- Add vendor_type to invoice_data table
ALTER TABLE invoice_data
ADD COLUMN vendor_type ENUM('vodafone', 'tata') DEFAULT 'vodafone'
COMMENT 'Type of vendor (vodafone or tata)' AFTER batch_id;
