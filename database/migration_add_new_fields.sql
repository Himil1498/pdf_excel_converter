-- Migration to add additional extractable fields
-- Run this to update existing database schema

USE pdf_excel_converter;

-- Add new fields to invoice_data table
ALTER TABLE invoice_data
    -- Invoice Details (Additional)
    ADD COLUMN IF NOT EXISTS invoice_ref_no VARCHAR(255) AFTER bill_number,
    ADD COLUMN IF NOT EXISTS previous_outstanding DECIMAL(15, 2) AFTER total,
    ADD COLUMN IF NOT EXISTS amount_in_words TEXT AFTER previous_outstanding,
    ADD COLUMN IF NOT EXISTS one_time_charges DECIMAL(15, 2) AFTER amount_in_words,
    ADD COLUMN IF NOT EXISTS recurring_charges DECIMAL(15, 2) AFTER one_time_charges,
    ADD COLUMN IF NOT EXISTS usage_charges DECIMAL(15, 2) AFTER recurring_charges,
    ADD COLUMN IF NOT EXISTS misc_charges DECIMAL(15, 2) AFTER usage_charges,
    ADD COLUMN IF NOT EXISTS total_taxable_charges DECIMAL(15, 2) AFTER misc_charges,

    -- Service Period
    ADD COLUMN IF NOT EXISTS service_period_from DATE AFTER billing_periodicity,
    ADD COLUMN IF NOT EXISTS service_period_to DATE AFTER service_period_from,

    -- Tax Details (Enhanced - actual amounts not just rates)
    ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(15, 2) AFTER cgst,
    ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(15, 2) AFTER sgst,
    ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(15, 2) AFTER igst,
    ADD COLUMN IF NOT EXISTS total_tax_amount DECIMAL(15, 2) AFTER igst_amount,

    -- Vendor Information
    ADD COLUMN IF NOT EXISTS vendor_cin VARCHAR(50) AFTER vendor_name,
    ADD COLUMN IF NOT EXISTS vendor_pan VARCHAR(20) AFTER vendor_cin,
    ADD COLUMN IF NOT EXISTS vendor_gstin VARCHAR(50) AFTER vendor_pan,
    ADD COLUMN IF NOT EXISTS vendor_email VARCHAR(255) AFTER vendor_gstin,
    ADD COLUMN IF NOT EXISTS vendor_phone VARCHAR(50) AFTER vendor_email,
    ADD COLUMN IF NOT EXISTS vendor_toll_free VARCHAR(50) AFTER vendor_phone,
    ADD COLUMN IF NOT EXISTS vendor_business_address TEXT AFTER vendor_toll_free,
    ADD COLUMN IF NOT EXISTS vendor_registered_address TEXT AFTER vendor_business_address,

    -- Place of Supply
    ADD COLUMN IF NOT EXISTS place_of_supply_state VARCHAR(100) AFTER destination_of_supply,
    ADD COLUMN IF NOT EXISTS place_of_supply_state_code VARCHAR(10) AFTER place_of_supply_state,

    -- Payment/Bank Details
    ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255) AFTER installation_address,
    ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50) AFTER bank_name,
    ADD COLUMN IF NOT EXISTS bank_branch_address TEXT AFTER bank_account_number,
    ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20) AFTER bank_branch_address,
    ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20) AFTER ifsc_code,
    ADD COLUMN IF NOT EXISTS micr_code VARCHAR(20) AFTER swift_code,

    -- Additional Metadata
    ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(50) AFTER invoice_ref_no,
    ADD COLUMN IF NOT EXISTS reverse_charge_applicable BOOLEAN DEFAULT FALSE AFTER invoice_type,
    ADD COLUMN IF NOT EXISTS nature_of_service VARCHAR(100) AFTER product_flavor,

    -- Add indexes for better performance
    ADD INDEX IF NOT EXISTS idx_invoice_ref (invoice_ref_no),
    ADD INDEX IF NOT EXISTS idx_relationship (relationship_number),
    ADD INDEX IF NOT EXISTS idx_circuit (circuit_id),
    ADD INDEX IF NOT EXISTS idx_dates (bill_date, due_date);

-- Create new table for data validation rules
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

-- Create table for validation results
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
    INDEX idx_pdf_record (pdf_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for invoice comparisons
CREATE TABLE IF NOT EXISTS invoice_comparisons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    circuit_id VARCHAR(100) NOT NULL,
    current_invoice_id INT NOT NULL,
    previous_invoice_id INT,
    comparison_type ENUM('month_over_month', 'cost_change', 'bandwidth_change') NOT NULL,
    current_value DECIMAL(15, 2),
    previous_value DECIMAL(15, 2),
    change_amount DECIMAL(15, 2),
    change_percentage DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_invoice_id) REFERENCES invoice_data(id) ON DELETE CASCADE,
    FOREIGN KEY (previous_invoice_id) REFERENCES invoice_data(id) ON DELETE SET NULL,
    INDEX idx_circuit (circuit_id),
    INDEX idx_type (comparison_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for alerts/notifications
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT,
    invoice_id INT,
    alert_type ENUM('cost_spike', 'missing_data', 'duplicate_invoice', 'payment_due', 'unusual_charge', 'validation_error') NOT NULL,
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
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for scheduled jobs
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_name VARCHAR(255) NOT NULL,
    job_type ENUM('batch_processing', 'report_generation', 'cloud_sync', 'data_cleanup') NOT NULL,
    schedule_cron VARCHAR(100) NOT NULL,
    config JSON,
    last_run_at TIMESTAMP NULL,
    next_run_at TIMESTAMP NULL,
    status ENUM('active', 'paused', 'completed', 'failed') DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_next_run (next_run_at, is_active),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for manual corrections
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
    INDEX idx_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for export history
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
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default validation rules
INSERT INTO validation_rules (field_name, rule_type, rule_config, error_message, severity) VALUES
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

-- Add comment to document the changes
ALTER TABLE invoice_data COMMENT = 'Extended schema with 27 additional fields for comprehensive invoice data capture';

COMMIT;
