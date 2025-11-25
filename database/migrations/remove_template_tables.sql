-- ============================================================================
-- Remove Template Tables Migration
-- ============================================================================
-- This migration removes the field_templates and custom_fields tables
-- Run this to clean up template-related functionality from the database
-- ============================================================================

USE pdf_excel_converter;

-- Drop custom_fields table
DROP TABLE IF EXISTS custom_fields;

-- Drop field_templates table
DROP TABLE IF EXISTS field_templates;

-- Verify tables are dropped
SELECT
    'Template tables removed successfully' AS status,
    COUNT(*) AS remaining_tables
FROM information_schema.tables
WHERE table_schema = 'pdf_excel_converter'
AND table_name IN ('field_templates', 'custom_fields');
