-- ============================================================================
-- PDF to Excel Converter - Complete Database Schema & Queries
-- ============================================================================
-- Last Updated: November 25, 2025
-- Database: pdf_excel_converter
-- Total Tables: 13
-- MySQL Version: 8.0+
-- Password: H!m!l@1498@!!
-- ============================================================================

-- ============================================================================
-- DATABASE CREATION & SETUP
-- ============================================================================

CREATE DATABASE IF NOT EXISTS pdf_excel_converter;
USE pdf_excel_converter;

-- ============================================================================
-- CORE TABLES (3 Tables)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. upload_batches - Batch Processing Records
-- ----------------------------------------------------------------------------
-- Stores batch information for bulk PDF uploads
-- Total Columns: 11

CREATE TABLE IF NOT EXISTS upload_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_name VARCHAR(255) NOT NULL,
    vendor_type ENUM('vodafone', 'tata', 'airtel', 'indus', 'ascend', 'sify', 'bsnl', 'custom') DEFAULT 'vodafone',
    total_files INT NOT NULL DEFAULT 0,
    processed_files INT NOT NULL DEFAULT 0,
    failed_files INT NOT NULL DEFAULT 0,
    status ENUM('pending', 'processing', 'completed', 'failed', 'partial') DEFAULT 'pending',
    excel_file_path VARCHAR(500),
    include_blank_columns TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_vendor_type (vendor_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Batch processing records for bulk PDF uploads';

-- Common Queries for upload_batches:

-- Get all batches with summary
SELECT id, batch_name, vendor_type, status, total_files, processed_files,
       failed_files, created_at
FROM upload_batches
ORDER BY created_at DESC;

-- Get batch by ID
SELECT * FROM upload_batches WHERE id = ?;

-- Get batches by vendor
SELECT * FROM upload_batches
WHERE vendor_type = 'vodafone'
ORDER BY created_at DESC;

-- Get recent completed batches
SELECT * FROM upload_batches
WHERE status = 'completed'
ORDER BY created_at DESC
LIMIT 10;

-- Get batch statistics by vendor
SELECT vendor_type,
       COUNT(*) as batch_count,
       SUM(total_files) as total_files,
       SUM(processed_files) as processed_files,
       SUM(failed_files) as failed_files
FROM upload_batches
GROUP BY vendor_type;

-- Update batch progress
UPDATE upload_batches
SET status = ?, processed_files = ?, failed_files = ?, updated_at = NOW()
WHERE id = ?;

-- Delete old batches (older than 30 days)
DELETE FROM upload_batches
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);


-- ----------------------------------------------------------------------------
-- 2. pdf_records - Individual PDF Processing Records
-- ----------------------------------------------------------------------------
-- Stores processing status and extracted data for each PDF file
-- Total Columns: 11

CREATE TABLE IF NOT EXISTS pdf_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    vendor_type ENUM('vodafone', 'tata', 'airtel', 'indus', 'ascend', 'sify', 'bsnl', 'custom') DEFAULT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT,
    extracted_data JSON,
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (batch_id) REFERENCES upload_batches(id) ON DELETE CASCADE,
    INDEX idx_batch_status (batch_id, status),
    INDEX idx_filename (filename),
    INDEX idx_vendor_type (vendor_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Individual PDF file processing records';

-- Common Queries for pdf_records:

-- Get all PDFs in a batch
SELECT id, filename, status, error_message, processing_time_ms
FROM pdf_records
WHERE batch_id = ?
ORDER BY created_at;

-- Get failed PDFs
SELECT id, filename, error_message
FROM pdf_records
WHERE batch_id = ? AND status = 'failed';

-- Get completed PDFs with data
SELECT id, filename, extracted_data, processing_time_ms
FROM pdf_records
WHERE batch_id = ? AND status = 'completed';

-- Search PDFs by filename
SELECT * FROM pdf_records
WHERE filename LIKE '%search_term%'
ORDER BY created_at DESC;

-- Average processing time by vendor
SELECT vendor_type,
       COUNT(*) as total_pdfs,
       AVG(processing_time_ms) as avg_time_ms,
       MIN(processing_time_ms) as min_time_ms,
       MAX(processing_time_ms) as max_time_ms
FROM pdf_records
WHERE status = 'completed'
GROUP BY vendor_type;

-- Update PDF status
UPDATE pdf_records
SET status = ?, error_message = ?, processing_time_ms = ?, updated_at = NOW()
WHERE id = ?;

-- Retry failed PDFs (reset to pending)
UPDATE pdf_records
SET status = 'pending', error_message = NULL, updated_at = NOW()
WHERE batch_id = ? AND status = 'failed';

-- Get processing statistics
SELECT
    status,
    COUNT(*) as count,
    AVG(processing_time_ms) as avg_time
FROM pdf_records
WHERE batch_id = ?
GROUP BY status;


-- ----------------------------------------------------------------------------
-- 3. invoice_data - Extracted Invoice Data
-- ----------------------------------------------------------------------------
-- Stores all extracted fields from invoices (110+ columns)
-- Total Columns: 110+

CREATE TABLE IF NOT EXISTS invoice_data (
    -- Primary Keys & References
    id INT AUTO_INCREMENT PRIMARY KEY,
    pdf_record_id INT NOT NULL,
    batch_id INT NOT NULL,

    -- Basic Info
    filename VARCHAR(255),
    vendor_type ENUM('vodafone', 'tata', 'airtel', 'indus', 'ascend', 'sify', 'bsnl', 'custom') DEFAULT NULL,

    -- Invoice Details
    bill_date DATE,
    due_date DATE,
    bill_id VARCHAR(100),
    vendor_name VARCHAR(255),
    payment_terms_label VARCHAR(100),
    payment_terms INT,
    vendor_circuit_id VARCHAR(100),
    bill_number VARCHAR(100),
    invoice_number VARCHAR(100),
    invoice_ref_no VARCHAR(255),
    invoice_type VARCHAR(50),
    purchase_order VARCHAR(100),
    purchase_order_number VARCHAR(100),
    currency_code VARCHAR(10) DEFAULT 'INR',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0000,

    -- Financial Amounts
    sub_total DECIMAL(15, 2),
    total DECIMAL(15, 2),
    balance DECIMAL(15, 2),
    previous_outstanding DECIMAL(15, 2),
    amount_in_words TEXT,
    one_time_charges DECIMAL(15, 2),
    recurring_charges DECIMAL(15, 2),
    usage_charges DECIMAL(15, 2),
    misc_charges DECIMAL(15, 2),
    total_taxable_charges DECIMAL(15, 2),
    round_off DECIMAL(10, 2),

    -- Branch Details
    branch_id VARCHAR(100),
    branch_name VARCHAR(255),

    -- Item Details
    item_name VARCHAR(255),
    item_type VARCHAR(50),
    account VARCHAR(100),
    description TEXT,
    quantity DECIMAL(10, 2),
    usage_unit VARCHAR(50),

    -- Tax Details
    tax_name VARCHAR(100),
    tax_percentage DECIMAL(5, 4),
    tax_amount DECIMAL(15, 2),

    -- GST Breakdown - Rates
    cgst_rate DECIMAL(5, 4),
    sgst_rate DECIMAL(5, 4),
    igst_rate DECIMAL(5, 4),
    cess_rate DECIMAL(5, 4),

    -- GST Breakdown - Amounts
    cgst DECIMAL(15, 2),
    sgst DECIMAL(15, 2),
    igst DECIMAL(15, 2),
    cess DECIMAL(15, 2),
    cgst_amount DECIMAL(15, 2),
    sgst_amount DECIMAL(15, 2),
    igst_amount DECIMAL(15, 2),
    total_tax_amount DECIMAL(15, 2),

    -- GST FCY (Foreign Currency)
    cgst_fcy DECIMAL(15, 2),
    sgst_fcy DECIMAL(15, 2),
    igst_fcy DECIMAL(15, 2),

    -- TDS/TCS
    tds_rate DECIMAL(5, 4),
    tds_amount DECIMAL(15, 2),
    tcs_rate DECIMAL(5, 4),
    tcs_amount DECIMAL(15, 2),

    -- Location Details
    source_of_supply VARCHAR(100),
    destination_of_supply VARCHAR(100),
    place_of_supply VARCHAR(100),
    place_of_supply_state VARCHAR(100),
    place_of_supply_state_code VARCHAR(10),
    state_code VARCHAR(10),
    gstin VARCHAR(50),
    gstin_isd_uin VARCHAR(50),
    line_item_location_name VARCHAR(255),
    location_name VARCHAR(255),
    hsn_sac VARCHAR(50),

    -- Vendor Information
    vendor_cin VARCHAR(50),
    vendor_pan VARCHAR(20),
    vendor_gstin VARCHAR(50),
    vendor_email VARCHAR(255),
    vendor_phone VARCHAR(50),
    vendor_toll_free VARCHAR(50),
    vendor_business_address TEXT,
    vendor_registered_address TEXT,

    -- Service Details
    circuit_id VARCHAR(100),
    service_type VARCHAR(100),
    nature_of_service VARCHAR(100),
    reverse_charge_applicable BOOLEAN DEFAULT FALSE,

    -- Service Period
    service_period_from DATE,
    service_period_to DATE,
    charges_of_periods VARCHAR(255),
    billing_periodicity VARCHAR(50),

    -- Network Details
    port_bandwidth VARCHAR(50),
    cir_bandwidth VARCHAR(50),
    bandwidth DECIMAL(10, 2),
    bandwidth_mbps DECIMAL(10, 2),
    plan_name VARCHAR(255),
    product_flavor VARCHAR(255),
    vpn_topology VARCHAR(50),
    type_of_site VARCHAR(100),
    annual_charges DECIMAL(15, 2),

    -- Relationship Details
    relationship_number VARCHAR(100),
    control_number VARCHAR(100),

    -- Company/Customer Details
    company_name VARCHAR(255),
    ship_to_address TEXT,
    bill_to_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pin VARCHAR(20),
    contact_person VARCHAR(255),
    contact_number VARCHAR(50),
    installation_address TEXT,

    -- Payment/Bank Details
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_branch_address TEXT,
    ifsc_code VARCHAR(20),
    swift_code VARCHAR(20),
    micr_code VARCHAR(20),

    -- Custom Fields (CF prefix - ZOHO format)
    cf_vendor_circuit_id VARCHAR(100),
    cf_bandwidth_mbps DECIMAL(10, 2),
    cf_annual_charges DECIMAL(15, 2),
    cf_po_arc_value DECIMAL(15, 2),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (pdf_record_id) REFERENCES pdf_records(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES upload_batches(id) ON DELETE CASCADE,

    -- Indexes for performance
    INDEX idx_batch (batch_id),
    INDEX idx_bill_number (bill_number),
    INDEX idx_vendor (vendor_name),
    INDEX idx_vendor_type (vendor_type),
    INDEX idx_invoice_ref (invoice_ref_no),
    INDEX idx_relationship (relationship_number),
    INDEX idx_circuit (circuit_id),
    INDEX idx_dates (bill_date, due_date),
    INDEX idx_bill_date (bill_date),
    INDEX idx_total (total)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Extracted invoice data with 110+ fields';

-- Common Queries for invoice_data:

-- Get all invoices in a batch
SELECT id, filename, bill_number, bill_date, vendor_name, total, vendor_type
FROM invoice_data
WHERE batch_id = ?
ORDER BY bill_date DESC;

-- Search invoices by vendor and date range
SELECT filename, bill_number, bill_date, vendor_name, total, vendor_type
FROM invoice_data
WHERE vendor_type = 'vodafone'
  AND bill_date BETWEEN '2025-01-01' AND '2025-12-31'
ORDER BY bill_date DESC;

-- Get invoice with full details
SELECT * FROM invoice_data WHERE id = ?;

-- Get total billing by vendor
SELECT vendor_type,
       vendor_name,
       COUNT(*) as invoice_count,
       SUM(total) as total_amount,
       AVG(total) as avg_amount,
       SUM(cgst) as total_cgst,
       SUM(sgst) as total_sgst,
       SUM(igst) as total_igst
FROM invoice_data
GROUP BY vendor_type, vendor_name
ORDER BY total_amount DESC;

-- Get invoices with GST breakdown
SELECT bill_number, bill_date, vendor_name,
       sub_total, cgst, sgst, igst, tax_amount, total
FROM invoice_data
WHERE batch_id = ?
ORDER BY bill_date;

-- Find duplicate invoices
SELECT bill_number, vendor_name, COUNT(*) as count
FROM invoice_data
GROUP BY bill_number, vendor_name
HAVING count > 1;

-- Get branch-wise spending
SELECT branch_name,
       COUNT(*) as invoice_count,
       SUM(total) as total_spent,
       AVG(total) as avg_spent
FROM invoice_data
WHERE vendor_type = ?
GROUP BY branch_name
ORDER BY total_spent DESC;

-- Monthly invoice summary
SELECT DATE_FORMAT(bill_date, '%Y-%m') as month,
       vendor_type,
       COUNT(*) as invoice_count,
       SUM(total) as total_amount,
       SUM(cgst + sgst + igst) as total_gst
FROM invoice_data
WHERE bill_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY month, vendor_type
ORDER BY month DESC;

-- Search invoices by amount range
SELECT id, bill_number, bill_date, vendor_name, total
FROM invoice_data
WHERE total BETWEEN ? AND ?
ORDER BY total DESC;

-- Get invoices due soon (next 7 days)
SELECT id, bill_number, bill_date, due_date, vendor_name, total
FROM invoice_data
WHERE due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY due_date;

-- Get circuit-wise spending
SELECT circuit_id,
       vendor_name,
       COUNT(*) as invoice_count,
       SUM(total) as total_cost,
       MAX(bandwidth_mbps) as bandwidth
FROM invoice_data
WHERE circuit_id IS NOT NULL
GROUP BY circuit_id, vendor_name
ORDER BY total_cost DESC;


-- ============================================================================
-- TEMPLATE MANAGEMENT TABLES (2 Tables)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4. field_templates - Extraction Templates
-- ----------------------------------------------------------------------------
-- Stores regex patterns and field mappings for different vendors
-- Total Columns: 8

CREATE TABLE IF NOT EXISTS field_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL UNIQUE,
    vendor_type VARCHAR(100),
    vendor_name VARCHAR(255),
    description TEXT,
    field_mappings JSON NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_vendor (vendor_name),
    INDEX idx_vendor_type (vendor_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Field extraction templates for different vendors';

-- Common Queries for field_templates:

-- Get all templates
SELECT id, template_name, vendor_type, vendor_name, is_default, created_at
FROM field_templates
ORDER BY template_name;

-- Get default template
SELECT * FROM field_templates
WHERE is_default = 1
LIMIT 1;

-- Get template by vendor
SELECT * FROM field_templates
WHERE vendor_type = 'vodafone';

-- Get template by ID with mappings
SELECT * FROM field_templates
WHERE id = ?;

-- Create new template
INSERT INTO field_templates
(template_name, vendor_type, vendor_name, description, field_mappings, is_default)
VALUES (?, ?, ?, ?, ?, ?);

-- Update template
UPDATE field_templates
SET field_mappings = ?, description = ?, updated_at = NOW()
WHERE id = ?;

-- Set as default template
UPDATE field_templates SET is_default = 0;
UPDATE field_templates SET is_default = 1 WHERE id = ?;

-- Delete template
DELETE FROM field_templates WHERE id = ?;


-- ----------------------------------------------------------------------------
-- 5. custom_fields - User-Defined Custom Fields
-- ----------------------------------------------------------------------------
-- Stores custom field definitions created by users
-- Total Columns: 9

CREATE TABLE IF NOT EXISTS custom_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field_name VARCHAR(255) NOT NULL,
    field_label VARCHAR(255),
    field_type ENUM('text', 'number', 'date', 'currency', 'boolean') NOT NULL,
    excel_column_name VARCHAR(255) NOT NULL,
    extraction_pattern TEXT,
    default_value TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User-defined custom fields';

-- Common Queries for custom_fields:

-- Get all active custom fields
SELECT * FROM custom_fields
WHERE is_active = 1
ORDER BY display_order;

-- Get all custom fields
SELECT * FROM custom_fields
ORDER BY display_order;

-- Create custom field
INSERT INTO custom_fields
(field_name, field_label, field_type, excel_column_name, extraction_pattern, default_value, display_order)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Update custom field
UPDATE custom_fields
SET field_label = ?, default_value = ?, extraction_pattern = ?, updated_at = NOW()
WHERE id = ?;

-- Toggle field active status
UPDATE custom_fields
SET is_active = ?, updated_at = NOW()
WHERE id = ?;

-- Delete custom field
DELETE FROM custom_fields WHERE id = ?;

-- Reorder custom fields
UPDATE custom_fields SET display_order = ? WHERE id = ?;


-- ============================================================================
-- PROCESSING & LOGS TABLE (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6. processing_logs - Processing Activity Logs
-- ----------------------------------------------------------------------------
-- Stores detailed logs of processing activities
-- Total Columns: 7

CREATE TABLE IF NOT EXISTS processing_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT,
    pdf_record_id INT,
    log_level ENUM('info', 'warning', 'error', 'debug') DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (batch_id) REFERENCES upload_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (pdf_record_id) REFERENCES pdf_records(id) ON DELETE CASCADE,
    INDEX idx_batch_level (batch_id, log_level),
    INDEX idx_created_at (created_at),
    INDEX idx_log_level (log_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Processing activity logs';

-- Common Queries for processing_logs:

-- Get logs for a batch
SELECT log_level, message, metadata, created_at
FROM processing_logs
WHERE batch_id = ?
ORDER BY created_at DESC;

-- Get error logs only
SELECT batch_id, pdf_record_id, message, created_at
FROM processing_logs
WHERE log_level = 'error'
ORDER BY created_at DESC
LIMIT 100;

-- Get logs for specific PDF
SELECT log_level, message, metadata, created_at
FROM processing_logs
WHERE pdf_record_id = ?
ORDER BY created_at;

-- Get recent logs (last 24 hours)
SELECT * FROM processing_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY created_at DESC;

-- Insert log entry
INSERT INTO processing_logs
(batch_id, pdf_record_id, log_level, message, metadata)
VALUES (?, ?, ?, ?, ?);

-- Clean old logs (older than 90 days)
DELETE FROM processing_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Get log statistics
SELECT log_level, COUNT(*) as count
FROM processing_logs
WHERE batch_id = ?
GROUP BY log_level;


-- ============================================================================
-- VALIDATION TABLES (2 Tables)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7. validation_rules - Data Validation Rules
-- ----------------------------------------------------------------------------
-- Stores validation rules for invoice fields
-- Total Columns: 8

CREATE TABLE IF NOT EXISTS validation_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field_name VARCHAR(255) NOT NULL,
    rule_type ENUM('required', 'numeric', 'date', 'gstin', 'email', 'phone', 'range', 'regex') NOT NULL,
    rule_config JSON,
    error_message VARCHAR(500),
    severity ENUM('error', 'warning', 'info') DEFAULT 'error',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_field_active (field_name, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Data validation rules';

-- Common Queries for validation_rules:

-- Get all active validation rules
SELECT * FROM validation_rules
WHERE is_active = 1
ORDER BY field_name;

-- Get rules for specific field
SELECT * FROM validation_rules
WHERE field_name = ? AND is_active = 1;

-- Create validation rule
INSERT INTO validation_rules
(field_name, rule_type, rule_config, error_message, severity)
VALUES (?, ?, ?, ?, ?);

-- Update validation rule
UPDATE validation_rules
SET rule_config = ?, error_message = ?, severity = ?, updated_at = NOW()
WHERE id = ?;

-- Toggle rule active status
UPDATE validation_rules
SET is_active = ?, updated_at = NOW()
WHERE id = ?;

-- Delete validation rule
DELETE FROM validation_rules WHERE id = ?;


-- ----------------------------------------------------------------------------
-- 8. validation_results - Validation Results
-- ----------------------------------------------------------------------------
-- Stores results of validation checks on invoice data
-- Total Columns: 9

CREATE TABLE IF NOT EXISTS validation_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pdf_record_id INT NOT NULL,
    batch_id INT NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    rule_id INT,
    status ENUM('pass', 'fail', 'warning') NOT NULL,
    message TEXT,
    original_value TEXT,
    suggested_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pdf_record_id) REFERENCES pdf_records(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES upload_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES validation_rules(id) ON DELETE SET NULL,
    INDEX idx_batch_status (batch_id, status),
    INDEX idx_pdf_record (pdf_record_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Validation check results';

-- Common Queries for validation_results:

-- Get validation errors for a batch
SELECT vr.*, pr.filename
FROM validation_results vr
JOIN pdf_records pr ON vr.pdf_record_id = pr.id
WHERE vr.batch_id = ? AND vr.status = 'fail'
ORDER BY vr.created_at DESC;

-- Get all validation issues (errors + warnings)
SELECT * FROM validation_results
WHERE batch_id = ? AND status IN ('fail', 'warning')
ORDER BY status, field_name;

-- Get validation results for specific PDF
SELECT field_name, status, message, original_value, suggested_value
FROM validation_results
WHERE pdf_record_id = ?
ORDER BY status DESC;

-- Insert validation result
INSERT INTO validation_results
(pdf_record_id, batch_id, field_name, rule_id, status, message, original_value, suggested_value)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Get validation summary for batch
SELECT status, COUNT(*) as count
FROM validation_results
WHERE batch_id = ?
GROUP BY status;

-- Clear validation results for batch
DELETE FROM validation_results WHERE batch_id = ?;


-- ============================================================================
-- CORRECTION TABLES (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 9. manual_corrections - Manual Data Corrections
-- ----------------------------------------------------------------------------
-- Stores history of manual corrections made to invoice data
-- Total Columns: 11

CREATE TABLE IF NOT EXISTS manual_corrections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    original_value TEXT,
    corrected_value TEXT,
    correction_reason VARCHAR(500),
    corrected_by VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (invoice_id) REFERENCES invoice_data(id) ON DELETE CASCADE,
    INDEX idx_invoice (invoice_id),
    INDEX idx_approved (is_approved),
    INDEX idx_field (field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Manual correction history';

-- Common Queries for manual_corrections:

-- Get corrections for an invoice
SELECT * FROM manual_corrections
WHERE invoice_id = ?
ORDER BY created_at DESC;

-- Get pending corrections
SELECT mc.*, id.bill_number, id.vendor_name
FROM manual_corrections mc
JOIN invoice_data id ON mc.invoice_id = id.id
WHERE mc.is_approved = 0
ORDER BY mc.created_at;

-- Get recent corrections (last 50)
SELECT * FROM manual_corrections
ORDER BY created_at DESC
LIMIT 50;

-- Insert correction
INSERT INTO manual_corrections
(invoice_id, field_name, original_value, corrected_value, correction_reason, corrected_by)
VALUES (?, ?, ?, ?, ?, ?);

-- Approve correction
UPDATE manual_corrections
SET is_approved = 1, approved_by = ?, approved_at = NOW()
WHERE id = ?;

-- Get corrections by user
SELECT * FROM manual_corrections
WHERE corrected_by = ?
ORDER BY created_at DESC;

-- Get field-wise correction statistics
SELECT field_name, COUNT(*) as correction_count
FROM manual_corrections
GROUP BY field_name
ORDER BY correction_count DESC;


-- ============================================================================
-- COMPARISON TABLES (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 10. invoice_comparisons - Invoice Comparison Results
-- ----------------------------------------------------------------------------
-- Stores results of invoice comparisons
-- Total Columns: 10

CREATE TABLE IF NOT EXISTS invoice_comparisons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    circuit_id VARCHAR(100) NOT NULL,
    current_invoice_id INT NOT NULL,
    previous_invoice_id INT,
    comparison_type ENUM('month_over_month', 'cost_change', 'bandwidth_change', 'manual') NOT NULL,
    current_value DECIMAL(15, 2),
    previous_value DECIMAL(15, 2),
    change_amount DECIMAL(15, 2),
    change_percentage DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (current_invoice_id) REFERENCES invoice_data(id) ON DELETE CASCADE,
    FOREIGN KEY (previous_invoice_id) REFERENCES invoice_data(id) ON DELETE SET NULL,
    INDEX idx_circuit (circuit_id),
    INDEX idx_type (comparison_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Invoice comparison results';

-- Common Queries for invoice_comparisons:

-- Get all comparisons
SELECT ic.*,
       curr.bill_number as current_bill,
       prev.bill_number as previous_bill
FROM invoice_comparisons ic
JOIN invoice_data curr ON ic.current_invoice_id = curr.id
LEFT JOIN invoice_data prev ON ic.previous_invoice_id = prev.id
ORDER BY ic.created_at DESC;

-- Get comparisons by circuit
SELECT * FROM invoice_comparisons
WHERE circuit_id = ?
ORDER BY created_at DESC;

-- Get cost change comparisons
SELECT ic.*, curr.bill_number, curr.vendor_name
FROM invoice_comparisons ic
JOIN invoice_data curr ON ic.current_invoice_id = curr.id
WHERE ic.comparison_type = 'cost_change'
  AND ABS(ic.change_percentage) > 10
ORDER BY ABS(ic.change_percentage) DESC;

-- Insert comparison
INSERT INTO invoice_comparisons
(circuit_id, current_invoice_id, previous_invoice_id, comparison_type,
 current_value, previous_value, change_amount, change_percentage, notes)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Get comparison by ID
SELECT * FROM invoice_comparisons WHERE id = ?;

-- Delete old comparisons
DELETE FROM invoice_comparisons
WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY);


-- ============================================================================
-- ALERTS TABLES (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 11. alerts - Smart Alerts & Notifications
-- ----------------------------------------------------------------------------
-- Stores alert rules and triggered alerts
-- Total Columns: 11

CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT,
    invoice_id INT,
    alert_type ENUM('cost_spike', 'missing_data', 'duplicate_invoice', 'payment_due', 'unusual_charge', 'validation_error', 'threshold_exceeded') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSON,
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (batch_id) REFERENCES upload_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoice_data(id) ON DELETE CASCADE,
    INDEX idx_type_severity (alert_type, severity),
    INDEX idx_unread (is_read, is_dismissed),
    INDEX idx_created (created_at),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Smart alerts and notifications';

-- Common Queries for alerts:

-- Get unread alerts
SELECT * FROM alerts
WHERE is_read = 0 AND is_dismissed = 0
ORDER BY severity DESC, created_at DESC;

-- Get alerts by severity
SELECT * FROM alerts
WHERE severity IN ('high', 'critical')
  AND is_dismissed = 0
ORDER BY created_at DESC;

-- Get alerts for batch
SELECT * FROM alerts
WHERE batch_id = ?
ORDER BY severity DESC, created_at DESC;

-- Get alerts for invoice
SELECT * FROM alerts
WHERE invoice_id = ?
ORDER BY created_at DESC;

-- Create alert
INSERT INTO alerts
(batch_id, invoice_id, alert_type, severity, title, message, metadata)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Mark alert as read
UPDATE alerts
SET is_read = 1
WHERE id = ?;

-- Dismiss alert
UPDATE alerts
SET is_dismissed = 1
WHERE id = ?;

-- Mark all as read
UPDATE alerts
SET is_read = 1
WHERE is_read = 0;

-- Get alert statistics
SELECT alert_type, severity, COUNT(*) as count
FROM alerts
WHERE is_dismissed = 0
GROUP BY alert_type, severity;

-- Delete old dismissed alerts
DELETE FROM alerts
WHERE is_dismissed = 1
  AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);


-- ============================================================================
-- SCHEDULER TABLES (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 12. scheduled_jobs - Automated Job Scheduler
-- ----------------------------------------------------------------------------
-- Stores scheduled job configurations
-- Total Columns: 11

CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_name VARCHAR(255) NOT NULL,
    job_type ENUM('batch_processing', 'report_generation', 'cloud_sync', 'data_cleanup', 'validation', 'export') NOT NULL,
    schedule_cron VARCHAR(100) NOT NULL,
    config JSON,
    last_run_at TIMESTAMP NULL,
    next_run_at TIMESTAMP NULL,
    status ENUM('active', 'paused', 'completed', 'failed') DEFAULT 'active',
    error_message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_next_run (next_run_at, is_active),
    INDEX idx_status (status),
    INDEX idx_job_type (job_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Scheduled automation jobs';

-- Common Queries for scheduled_jobs:

-- Get all active jobs
SELECT * FROM scheduled_jobs
WHERE is_active = 1
ORDER BY next_run_at;

-- Get jobs due to run
SELECT * FROM scheduled_jobs
WHERE is_active = 1
  AND status = 'active'
  AND next_run_at <= NOW()
ORDER BY next_run_at;

-- Get job by ID
SELECT * FROM scheduled_jobs WHERE id = ?;

-- Create scheduled job
INSERT INTO scheduled_jobs
(job_name, job_type, schedule_cron, config, next_run_at)
VALUES (?, ?, ?, ?, ?);

-- Update job run times
UPDATE scheduled_jobs
SET last_run_at = NOW(),
    next_run_at = ?,
    status = ?,
    updated_at = NOW()
WHERE id = ?;

-- Pause job
UPDATE scheduled_jobs
SET status = 'paused', updated_at = NOW()
WHERE id = ?;

-- Resume job
UPDATE scheduled_jobs
SET status = 'active', updated_at = NOW()
WHERE id = ?;

-- Delete job
DELETE FROM scheduled_jobs WHERE id = ?;

-- Get job execution history (last 10 runs)
SELECT id, job_name, last_run_at, next_run_at, status
FROM scheduled_jobs
ORDER BY last_run_at DESC
LIMIT 10;


-- ============================================================================
-- EXPORT HISTORY TABLE (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 13. export_history - Export Activity History
-- ----------------------------------------------------------------------------
-- Stores history of data exports
-- Total Columns: 8

CREATE TABLE IF NOT EXISTS export_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    export_format ENUM('excel', 'csv', 'json', 'pdf') NOT NULL,
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    row_count INT,
    exported_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (batch_id) REFERENCES upload_batches(id) ON DELETE CASCADE,
    INDEX idx_batch_format (batch_id, export_format),
    INDEX idx_created (created_at),
    INDEX idx_format (export_format)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Export activity history';

-- Common Queries for export_history:

-- Get export history for batch
SELECT * FROM export_history
WHERE batch_id = ?
ORDER BY created_at DESC;

-- Get recent exports
SELECT eh.*, ub.batch_name, ub.vendor_type
FROM export_history eh
JOIN upload_batches ub ON eh.batch_id = ub.id
ORDER BY eh.created_at DESC
LIMIT 50;

-- Get exports by format
SELECT * FROM export_history
WHERE export_format = 'excel'
ORDER BY created_at DESC;

-- Insert export record
INSERT INTO export_history
(batch_id, export_format, file_path, file_size_bytes, row_count, exported_by)
VALUES (?, ?, ?, ?, ?, ?);

-- Get export statistics
SELECT export_format,
       COUNT(*) as export_count,
       SUM(file_size_bytes) as total_bytes,
       AVG(file_size_bytes) as avg_bytes,
       SUM(row_count) as total_rows
FROM export_history
GROUP BY export_format;

-- Delete old export records (older than 90 days)
DELETE FROM export_history
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);


-- ============================================================================
-- DEFAULT DATA INSERTION
-- ============================================================================

-- Insert default validation rules
INSERT IGNORE INTO validation_rules (field_name, rule_type, rule_config, error_message, severity) VALUES
('bill_number', 'required', '{}', 'Invoice number is required', 'error'),
('bill_date', 'required', '{}', 'Invoice date is required', 'error'),
('due_date', 'required', '{}', 'Due date is required', 'error'),
('total', 'required', '{}', 'Total amount is required', 'error'),
('total', 'numeric', '{"min": 0}', 'Total amount must be a positive number', 'error'),
('gstin', 'gstin', '{}', 'Invalid GSTIN format', 'warning'),
('vendor_email', 'email', '{}', 'Invalid email format', 'warning'),
('contact_number', 'phone', '{}', 'Invalid phone number format', 'warning'),
('cgst_rate', 'range', '{"min": 0, "max": 100}', 'CGST rate must be between 0-100%', 'error'),
('sgst_rate', 'range', '{"min": 0, "max": 100}', 'SGST rate must be between 0-100%', 'error'),
('bandwidth_mbps', 'numeric', '{"min": 0}', 'Bandwidth must be a positive number', 'warning');

-- Insert default Vodafone template
INSERT IGNORE INTO field_templates (template_name, vendor_type, vendor_name, field_mappings, is_default) VALUES
('Vodafone Template', 'vodafone', 'Vodafone Idea Limited', '{
    "invoice_number": {"pattern": "Invoice No:\\\\s*([A-Z0-9]+)", "required": true},
    "bill_date": {"pattern": "Bill Cycle Date:\\\\s*(\\\\d{2}\\\\.\\\\d{2}\\\\.\\\\d{2})", "required": true, "format": "DD.MM.YY"},
    "due_date": {"pattern": "Due date:\\\\s*(\\\\d{2}\\\\.\\\\d{2}\\\\.\\\\d{4})", "required": true, "format": "DD.MM.YYYY"},
    "relationship_number": {"pattern": "Relationship no:\\\\s*(\\\\d+)", "required": true},
    "total_payable": {"pattern": "TOTAL PAYABLE\\\\s+([\\\\d,]+\\\\.\\\\d{2})", "required": true},
    "company_name": {"pattern": "Company Name\\\\s*:\\\\s*\\\\.\\\\s*([^\\\\n]+)", "required": true},
    "gstin": {"pattern": "GSTIN/GSTIN_ISD/UIN No:\\\\s*([A-Z0-9]+)", "required": false},
    "circuit_id": {"pattern": "Circuit ID\\\\s*:\\\\s*([A-Z0-9]+)", "required": false},
    "bandwidth": {"pattern": "CIR Bandwidth\\\\s*:\\\\s*(\\\\d+)\\\\s*Mbps", "required": false}
}', TRUE);


-- ============================================================================
-- USEFUL COMBINED QUERIES
-- ============================================================================

-- Get complete batch information with counts and totals
SELECT
    b.id,
    b.batch_name,
    b.vendor_type,
    b.status,
    b.total_files,
    b.processed_files,
    b.failed_files,
    b.created_at,
    COUNT(DISTINCT p.id) as pdf_count,
    COUNT(DISTINCT i.id) as invoice_count,
    SUM(i.total) as total_amount,
    SUM(i.cgst + i.sgst + i.igst) as total_gst
FROM upload_batches b
LEFT JOIN pdf_records p ON b.id = p.batch_id
LEFT JOIN invoice_data i ON b.id = i.batch_id
WHERE b.id = ?
GROUP BY b.id;

-- Get processing statistics by vendor
SELECT
    b.vendor_type,
    COUNT(DISTINCT b.id) as batch_count,
    SUM(b.total_files) as total_pdfs,
    SUM(b.processed_files) as processed_pdfs,
    SUM(b.failed_files) as failed_pdfs,
    ROUND(AVG(p.processing_time_ms), 2) as avg_processing_time_ms,
    COUNT(DISTINCT i.id) as invoice_count,
    SUM(i.total) as total_billing
FROM upload_batches b
LEFT JOIN pdf_records p ON b.id = p.batch_id AND p.status = 'completed'
LEFT JOIN invoice_data i ON b.id = i.batch_id
GROUP BY b.vendor_type;

-- Get invoice details with PDF and batch info
SELECT
    i.*,
    p.filename as pdf_filename,
    p.processing_time_ms,
    p.status as pdf_status,
    b.batch_name,
    b.vendor_type as batch_vendor_type
FROM invoice_data i
JOIN pdf_records p ON i.pdf_record_id = p.id
JOIN upload_batches b ON i.batch_id = b.id
WHERE i.id = ?;

-- Get vendor performance dashboard
SELECT
    i.vendor_type,
    i.vendor_name,
    COUNT(DISTINCT i.id) as invoice_count,
    COUNT(DISTINCT i.circuit_id) as unique_circuits,
    SUM(i.total) as total_billing,
    AVG(i.total) as avg_invoice_amount,
    SUM(i.cgst) as total_cgst,
    SUM(i.sgst) as total_sgst,
    SUM(i.igst) as total_igst,
    MIN(i.bill_date) as earliest_invoice,
    MAX(i.bill_date) as latest_invoice
FROM invoice_data i
GROUP BY i.vendor_type, i.vendor_name
ORDER BY total_billing DESC;

-- Get data quality report
SELECT
    b.id as batch_id,
    b.batch_name,
    b.total_files,
    b.processed_files,
    b.failed_files,
    COUNT(DISTINCT vr.id) as validation_errors,
    COUNT(DISTINCT CASE WHEN vr.status = 'fail' THEN vr.id END) as critical_errors,
    COUNT(DISTINCT CASE WHEN vr.status = 'warning' THEN vr.id END) as warnings,
    COUNT(DISTINCT mc.id) as manual_corrections
FROM upload_batches b
LEFT JOIN validation_results vr ON b.id = vr.batch_id
LEFT JOIN invoice_data i ON b.id = i.batch_id
LEFT JOIN manual_corrections mc ON i.id = mc.invoice_id
WHERE b.id = ?
GROUP BY b.id;


-- ============================================================================
-- DATABASE MAINTENANCE & OPTIMIZATION
-- ============================================================================

-- Clean old records (run monthly)
-- Delete batches older than 90 days
DELETE FROM upload_batches
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Clean processing logs older than 90 days
DELETE FROM processing_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Clean old validation results
DELETE FROM validation_results
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Clean dismissed alerts older than 30 days
DELETE FROM alerts
WHERE is_dismissed = 1
  AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Clean old export history
DELETE FROM export_history
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);


-- Optimize tables (run quarterly)
OPTIMIZE TABLE upload_batches;
OPTIMIZE TABLE pdf_records;
OPTIMIZE TABLE invoice_data;
OPTIMIZE TABLE processing_logs;
OPTIMIZE TABLE validation_results;


-- Get database statistics
SELECT
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb,
    table_rows,
    ROUND((data_length) / 1024 / 1024, 2) AS data_mb,
    ROUND((index_length) / 1024 / 1024, 2) AS index_mb
FROM information_schema.TABLES
WHERE table_schema = 'pdf_excel_converter'
ORDER BY (data_length + index_length) DESC;


-- Analyze table usage
SELECT
    table_name,
    table_rows,
    avg_row_length,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS total_mb
FROM information_schema.TABLES
WHERE table_schema = 'pdf_excel_converter'
ORDER BY table_rows DESC;


-- ============================================================================
-- BACKUP & RESTORE COMMANDS (Run from terminal, not MySQL)
-- ============================================================================

-- Full database backup
-- mysqldump -u root -p pdf_excel_converter > backup_$(date +%Y%m%d_%H%M%S).sql

-- Backup core tables only
-- mysqldump -u root -p pdf_excel_converter upload_batches pdf_records invoice_data > core_backup.sql

-- Backup with compression
-- mysqldump -u root -p pdf_excel_converter | gzip > backup_$(date +%Y%m%d).sql.gz

-- Restore from backup
-- mysql -u root -p pdf_excel_converter < backup_file.sql

-- Restore from compressed backup
-- gunzip < backup_file.sql.gz | mysql -u root -p pdf_excel_converter


-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- Total Tables: 13
-- Total Indexes: 60+
-- Status: PRODUCTION READY
-- Supported Vendors: 7 (Vodafone, Tata, Airtel, Indus, Ascend, Sify, BSNL)
-- ============================================================================
