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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 2. pdf_records - Individual PDF Processing Records
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 3. invoice_data - Extracted Invoice Data (110+ columns)
-- ----------------------------------------------------------------------------
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

    -- GST FCY
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

    -- Custom Fields (ZOHO format)
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

    -- Indexes
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TEMPLATE MANAGEMENT TABLES (2 Tables)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4. field_templates - Extraction Templates
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 5. custom_fields - User-Defined Custom Fields
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- PROCESSING & LOGS TABLE (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6. processing_logs - Processing Activity Logs
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- VALIDATION TABLES (2 Tables)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7. validation_rules - Data Validation Rules
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 8. validation_results - Validation Results
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- CORRECTION TABLES (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 9. manual_corrections - Manual Data Corrections
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- COMPARISON TABLES (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 10. invoice_comparisons - Invoice Comparison Results
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- ALERTS TABLES (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 11. alerts - Smart Alerts & Notifications
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- SCHEDULER TABLES (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 12. scheduled_jobs - Automated Job Scheduler
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- EXPORT HISTORY TABLE (1 Table)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 13. export_history - Export Activity History
-- ----------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- DEFAULT DATA INSERTION (FIXED JSON ESCAPING)
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

-- Insert default Vodafone template (FIXED JSON ESCAPING)
INSERT IGNORE INTO field_templates (template_name, vendor_type, vendor_name, field_mappings, is_default)
VALUES (
    'Vodafone Template',
    'vodafone',
    'Vodafone Idea Limited',
    '{"invoice_number": {"pattern": "Invoice No:\\\\s*([A-Z0-9]+)", "required": true}, "bill_date": {"pattern": "Bill Cycle Date:\\\\s*(\\\\d{2}\\\\.\\\\d{2}\\\\.\\\\d{2})", "required": true, "format": "DD.MM.YY"}, "due_date": {"pattern": "Due date:\\\\s*(\\\\d{2}\\\\.\\\\d{2}\\\\.\\\\d{4})", "required": true, "format": "DD.MM.YYYY"}, "relationship_number": {"pattern": "Relationship no:\\\\s*(\\\\d+)", "required": true}, "total_payable": {"pattern": "TOTAL PAYABLE\\\\s+([\\\\d,]+\\\\.\\\\d{2})", "required": true}, "company_name": {"pattern": "Company Name\\\\s*:\\\\s*\\\\.\\\\s*([^\\\\n]+)", "required": true}, "gstin": {"pattern": "GSTIN/GSTIN_ISD/UIN No:\\\\s*([A-Z0-9]+)", "required": false}, "circuit_id": {"pattern": "Circuit ID\\\\s*:\\\\s*([A-Z0-9]+)", "required": false}, "bandwidth": {"pattern": "CIR Bandwidth\\\\s*:\\\\s*(\\\\d+)\\\\s*Mbps", "required": false}}',
    TRUE
);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
