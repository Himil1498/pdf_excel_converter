-- PDF to Excel Converter Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS pdf_excel_converter;
USE pdf_excel_converter;

-- Table for storing upload batches
CREATE TABLE IF NOT EXISTS upload_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_name VARCHAR(255) NOT NULL,
    total_files INT NOT NULL DEFAULT 0,
    processed_files INT NOT NULL DEFAULT 0,
    failed_files INT NOT NULL DEFAULT 0,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    excel_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for storing individual PDF processing records
CREATE TABLE IF NOT EXISTS pdf_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
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
    INDEX idx_filename (filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for storing extracted invoice data
CREATE TABLE IF NOT EXISTS invoice_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pdf_record_id INT NOT NULL,
    batch_id INT NOT NULL,

    -- File Info
    filename VARCHAR(255),

    -- Invoice Details
    bill_date DATE,
    due_date DATE,
    bill_id VARCHAR(100),
    vendor_name VARCHAR(255),
    payment_terms_label VARCHAR(100),
    vendor_circuit_id VARCHAR(100),
    bill_number VARCHAR(100),
    purchase_order VARCHAR(100),
    currency_code VARCHAR(10),
    sub_total DECIMAL(15, 2),
    total DECIMAL(15, 2),

    -- Branch Details
    branch_id VARCHAR(100),
    branch_name VARCHAR(255),

    -- Item Details
    item_name VARCHAR(255),
    account VARCHAR(100),
    description TEXT,
    quantity DECIMAL(10, 2),
    usage_unit VARCHAR(50),
    tax_amount DECIMAL(15, 2),

    -- Location Details
    source_of_supply VARCHAR(100),
    destination_of_supply VARCHAR(100),
    gstin VARCHAR(50),
    line_item_location_name VARCHAR(255),
    gstin_isd_uin VARCHAR(50),
    hsn_sac VARCHAR(50),

    -- Additional Fields
    purchase_order_number VARCHAR(100),
    tax_name VARCHAR(100),
    tax_percentage DECIMAL(5, 4),
    item_type VARCHAR(50),

    -- Tax Breakdown
    cgst_rate DECIMAL(5, 4),
    sgst_rate DECIMAL(5, 4),
    igst_rate DECIMAL(5, 4),
    cgst_fcy DECIMAL(15, 2),
    sgst_fcy DECIMAL(15, 2),
    igst_fcy DECIMAL(15, 2),
    cgst DECIMAL(15, 2),
    sgst DECIMAL(15, 2),
    igst DECIMAL(15, 2),

    -- Custom Fields
    round_off DECIMAL(10, 2),
    po_arc_value DECIMAL(15, 2),
    charges_of_periods VARCHAR(255),
    bandwidth_mbps DECIMAL(10, 2),

    -- Relationship Details
    relationship_number VARCHAR(100),
    control_number VARCHAR(100),
    circuit_id VARCHAR(100),
    port_bandwidth VARCHAR(50),
    cir_bandwidth VARCHAR(50),
    plan_name VARCHAR(255),
    product_flavor VARCHAR(255),
    billing_periodicity VARCHAR(50),
    vpn_topology VARCHAR(50),
    type_of_site VARCHAR(100),
    annual_charges DECIMAL(15, 2),

    -- Company Details
    company_name VARCHAR(255),
    ship_to_address TEXT,
    bill_to_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pin VARCHAR(20),
    contact_person VARCHAR(255),
    contact_number VARCHAR(50),

    -- Installation Address
    installation_address TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (pdf_record_id) REFERENCES pdf_records(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES upload_batches(id) ON DELETE CASCADE,
    INDEX idx_batch (batch_id),
    INDEX idx_bill_number (bill_number),
    INDEX idx_vendor (vendor_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for field mapping templates
CREATE TABLE IF NOT EXISTS field_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL UNIQUE,
    vendor_name VARCHAR(255),
    field_mappings JSON NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vendor (vendor_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for custom field definitions
CREATE TABLE IF NOT EXISTS custom_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field_name VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'number', 'date', 'currency') NOT NULL,
    excel_column_name VARCHAR(255) NOT NULL,
    extraction_pattern TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for processing logs
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
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default field template for Vodafone invoices
INSERT INTO field_templates (template_name, vendor_name, field_mappings, is_default) VALUES
('Vodafone Template', 'Vodafone Idea', '{
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
