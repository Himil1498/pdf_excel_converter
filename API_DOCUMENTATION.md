# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

Currently, the API does not require authentication. In production, you should implement authentication/authorization.

## Response Format

All responses follow this structure:

```json
{
  "success": true|false,
  "message": "Status message",
  "data": { /* Response data */ }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Upload & Batch Processing

### Upload PDFs

Upload PDF files for batch processing.

**Endpoint**: `POST /upload`

**Content-Type**: `multipart/form-data`

**Parameters**:
- `pdfs` (file[], required): PDF files to upload (max 1000)
- `batchName` (string, required): Name for this batch
- `useAI` (boolean, optional): Use AI extraction (default: true)
- `templateId` (integer, optional): Template ID for extraction

**Example Request**:
```javascript
const formData = new FormData();
formData.append('batchName', 'Vodafone January 2025');
formData.append('useAI', 'true');
formData.append('templateId', '1');
// Add files
files.forEach(file => {
  formData.append('pdfs', file);
});

fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData
});
```

**Success Response** (202 Accepted):
```json
{
  "success": true,
  "message": "Files uploaded successfully. Processing started.",
  "batchId": 1,
  "totalFiles": 50
}
```

### Get All Batches

Retrieve list of all processing batches.

**Endpoint**: `GET /batches`

**Query Parameters**:
- `limit` (integer, optional): Number of results (default: 50)
- `offset` (integer, optional): Pagination offset (default: 0)

**Example Request**:
```bash
curl http://localhost:5000/api/batches?limit=20&offset=0
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "batch_name": "Vodafone January 2025",
      "total_files": 50,
      "processed_files": 50,
      "failed_files": 0,
      "status": "completed",
      "excel_file_path": "/uploads/exports/batch_1_2025-01-15.xlsx",
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:45:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

### Get Batch Status

Get current processing status of a batch.

**Endpoint**: `GET /batches/:batchId/status`

**Example Request**:
```bash
curl http://localhost:5000/api/batches/1/status
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "batch_name": "Vodafone January 2025",
    "total_files": 100,
    "processed_files": 75,
    "failed_files": 2,
    "status": "processing",
    "percentage": 77,
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Status Values**:
- `pending`: Waiting to start
- `processing`: Currently processing
- `completed`: All files processed
- `failed`: Batch processing failed

### Get Batch Details

Get detailed information about a batch including all PDF records and logs.

**Endpoint**: `GET /batches/:batchId`

**Example Request**:
```bash
curl http://localhost:5000/api/batches/1
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "batch": {
      "id": 1,
      "batch_name": "Vodafone January 2025",
      "total_files": 50,
      "processed_files": 50,
      "failed_files": 0,
      "status": "completed",
      "excel_file_path": "/uploads/exports/batch_1.xlsx",
      "created_at": "2025-01-15T10:30:00.000Z"
    },
    "pdfRecords": [
      {
        "id": 1,
        "filename": "invoice_001.pdf",
        "status": "completed",
        "processing_time_ms": 2340,
        "error_message": null,
        "extracted_data": "{ /* JSON data */ }",
        "created_at": "2025-01-15T10:30:00.000Z"
      }
    ],
    "logs": [
      {
        "id": 1,
        "log_level": "info",
        "message": "File processed successfully",
        "metadata": "{ /* JSON metadata */ }",
        "created_at": "2025-01-15T10:30:15.000Z"
      }
    ]
  }
}
```

### Download Excel File

Download the generated Excel file for a batch.

**Endpoint**: `GET /batches/:batchId/download`

**Example Request**:
```bash
curl -O http://localhost:5000/api/batches/1/download
```

**Success Response**:
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Downloads Excel file

**Error Response** (404):
```json
{
  "success": false,
  "message": "Excel file not yet generated"
}
```

### Delete Batch

Delete a batch and all associated data.

**Endpoint**: `DELETE /batches/:batchId`

**Example Request**:
```bash
curl -X DELETE http://localhost:5000/api/batches/1
```

**Success Response**:
```json
{
  "success": true,
  "message": "Batch deleted successfully"
}
```

---

## Templates

### Get All Templates

Retrieve all extraction templates.

**Endpoint**: `GET /templates`

**Example Request**:
```bash
curl http://localhost:5000/api/templates
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "template_name": "Vodafone Template",
      "vendor_name": "Vodafone Idea",
      "field_mappings": {
        "invoice_number": {
          "pattern": "Invoice No:\\s*([A-Z0-9]+)",
          "required": true
        },
        "total_payable": {
          "pattern": "TOTAL PAYABLE\\s+([\\d,]+\\.\\d{2})",
          "required": true
        }
      },
      "is_default": true,
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Template by ID

Retrieve a specific template.

**Endpoint**: `GET /templates/:templateId`

**Example Request**:
```bash
curl http://localhost:5000/api/templates/1
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "template_name": "Vodafone Template",
    "vendor_name": "Vodafone Idea",
    "field_mappings": { /* ... */ },
    "is_default": true
  }
}
```

### Create Template

Create a new extraction template.

**Endpoint**: `POST /templates`

**Request Body**:
```json
{
  "templateName": "Custom Vendor Template",
  "vendorName": "Custom Vendor Inc",
  "fieldMappings": {
    "invoice_number": {
      "pattern": "Invoice #:\\s*([A-Z0-9]+)",
      "required": true
    },
    "amount": {
      "pattern": "Total:\\s*\\$([\\d,]+\\.\\d{2})",
      "required": true
    }
  },
  "isDefault": false
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Template created successfully",
  "templateId": 2
}
```

### Update Template

Update an existing template.

**Endpoint**: `PUT /templates/:templateId`

**Request Body**: Same as Create Template

**Success Response**:
```json
{
  "success": true,
  "message": "Template updated successfully"
}
```

### Delete Template

Delete a template.

**Endpoint**: `DELETE /templates/:templateId`

**Success Response**:
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

---

## Custom Fields

### Get Custom Fields

Retrieve all active custom field definitions.

**Endpoint**: `GET /custom-fields`

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "field_name": "Circuit ID",
      "field_type": "text",
      "excel_column_name": "CF.CIRCUIT_ID",
      "extraction_pattern": "Circuit ID:\\s*([A-Z0-9]+)",
      "is_active": true,
      "display_order": 1
    }
  ]
}
```

### Create Custom Field

Define a new custom field for extraction.

**Endpoint**: `POST /custom-fields`

**Request Body**:
```json
{
  "fieldName": "Customer Reference",
  "fieldType": "text",
  "excelColumnName": "CF.CUSTOMER_REF",
  "extractionPattern": "Ref:\\s*([A-Z0-9]+)",
  "displayOrder": 10
}
```

**Field Types**:
- `text`: Text string
- `number`: Numeric value
- `date`: Date value
- `currency`: Monetary value

**Success Response** (201):
```json
{
  "success": true,
  "message": "Custom field created successfully",
  "fieldId": 5
}
```

### Update Custom Field

Update a custom field definition.

**Endpoint**: `PUT /custom-fields/:fieldId`

**Request Body**:
```json
{
  "fieldName": "Updated Name",
  "isActive": false
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Custom field updated successfully"
}
```

### Delete Custom Field

Delete a custom field.

**Endpoint**: `DELETE /custom-fields/:fieldId`

**Success Response**:
```json
{
  "success": true,
  "message": "Custom field deleted successfully"
}
```

---

## Health Check

### API Health

Check if the API is running.

**Endpoint**: `GET /health`

**Success Response**:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (Processing started) |
| 400 | Bad Request (Invalid parameters) |
| 404 | Not Found |
| 500 | Internal Server Error |
| 429 | Too Many Requests (Rate limited) |

---

## Rate Limiting

Default limits:
- 100 requests per 15 minutes per IP
- Configurable via environment variables

Rate limit headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

---

## Example: Complete Workflow

```javascript
// 1. Upload PDFs
const formData = new FormData();
formData.append('batchName', 'January Invoices');
formData.append('useAI', 'true');
files.forEach(f => formData.append('pdfs', f));

const uploadRes = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
const { batchId } = await uploadRes.json();

// 2. Poll for status
const checkStatus = async () => {
  const res = await fetch(`/api/batches/${batchId}/status`);
  const { data } = await res.json();
  return data;
};

const pollInterval = setInterval(async () => {
  const status = await checkStatus();
  console.log(`Progress: ${status.percentage}%`);

  if (status.status === 'completed') {
    clearInterval(pollInterval);
    // 3. Download Excel
    window.open(`/api/batches/${batchId}/download`);
  }
}, 3000);

// 4. Get detailed results
const detailsRes = await fetch(`/api/batches/${batchId}`);
const details = await detailsRes.json();
console.log(details.data.pdfRecords);
```

---

## WebSocket Support (Future)

Real-time updates for batch processing will be available via WebSocket in future versions.

---

For more information, see README.md and SETUP_GUIDE.md
