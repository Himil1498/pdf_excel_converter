-- Migration: Add include_blank_columns to upload_batches table
-- Date: 2025-11-11

USE pdf_excel_converter;

-- Add include_blank_columns column to upload_batches table
ALTER TABLE upload_batches
ADD COLUMN IF NOT EXISTS include_blank_columns TINYINT(1) DEFAULT 1
COMMENT 'Whether to include blank columns in Excel export (1 = include, 0 = exclude)';
