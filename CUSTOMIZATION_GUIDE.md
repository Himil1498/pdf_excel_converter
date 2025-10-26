# Customization Guide - PDF to Excel Converter

## Table of Contents
1. [How to Customize Field Extraction](#1-how-to-customize-field-extraction)
2. [Adding Support for New Vendors](#2-adding-support-for-new-vendors)
3. [Performance Optimization](#3-performance-optimization)
4. [Deployment to Production](#4-deployment-to-production)
5. [Feature Modifications](#5-feature-modifications)

---

## 1. How to Customize Field Extraction

### Method 1: Using Templates (UI - Easiest)

#### Step 1: Create a New Template

1. Open the application: `http://localhost:3000`
2. Go to **Templates** page
3. Click **"New Template"**
4. Fill in the details:

```json
{
  "templateName": "My Custom Template",
  "vendorName": "Custom Vendor Inc",
  "fieldMappings": {
    "invoice_number": {
      "pattern": "Invoice No[:.\\s]*([A-Z0-9]+)",
      "required": true
    },
    "invoice_date": {
      "pattern": "Date[:.\\s]*(\\d{2}/\\d{2}/\\d{4})",
      "required": true,
      "format": "DD/MM/YYYY"
    },
    "total_amount": {
      "pattern": "Total[:.\\s]*\\$?([\\d,]+\\.\\d{2})",
      "required": true
    },
    "company_name": {
      "pattern": "Company[:.\\s]*([^\\n]+)",
      "required": false
    }
  },
  "isDefault": false
}
```

5. Click **Save**

#### Step 2: Test Your Template

1. Go to **Upload** page
2. Select your new template from dropdown
3. Upload a test PDF
4. Check extracted data in batch details
5. Adjust patterns if needed

### Method 2: Database Templates (Advanced)

#### Step 1: Connect to MySQL

```bash
mysql -u root -p
USE pdf_excel_converter;
```

#### Step 2: Insert Template Directly

```sql
INSERT INTO field_templates (
  template_name,
  vendor_name,
  field_mappings,
  is_default
) VALUES (
  'Advanced Template',
  'Another Vendor',
  '{
    "invoice_id": {
      "pattern": "Invoice ID[:.\\\\s]*([A-Z0-9-]+)",
      "required": true
    },
    "amount": {
      "pattern": "Amount Due[:.\\\\s]*([\\\\d,]+\\\\.\\\\d{2})",
      "required": true
    }
  }',
  FALSE
);
```

**Important**: Escape backslashes in regex patterns for JSON!

### Method 3: Code-Level Customization (Most Flexible)

#### Step 1: Add New Fields to Database

Edit `database/schema.sql`:

```sql
ALTER TABLE invoice_data
ADD COLUMN custom_field_1 VARCHAR(255),
ADD COLUMN custom_field_2 DECIMAL(15, 2),
ADD COLUMN custom_field_3 DATE;
```

Apply changes:
```bash
mysql -u root -p pdf_excel_converter < database/schema.sql
```

#### Step 2: Update PDF Parser

Edit `backend/services/pdfParser.js`:

Add your extraction patterns in the `extractWithRegex` method:

```javascript
extractWithRegex(text) {
  const patterns = {
    // Existing patterns...

    // Add your custom patterns
    customField1: /Custom Field 1[:.\\s]*([^\\n]+)/i,
    customField2: /Custom Amount[:.\\s]*([\\d,]+\\.\\d{2})/i,
    customField3: /Custom Date[:.\\s]*(\\d{2}\\.\\d{2}\\.\\d{4})/i,
  };

  // Rest of the method...
}
```

#### Step 3: Update Excel Generator

Edit `backend/services/excelGenerator.js`:

Add columns in `defineColumns` method:

```javascript
defineColumns(customFields = null) {
  const defaultColumns = [
    // Existing columns...

    // Add your custom columns
    { header: 'Custom Field 1', key: 'customField1', width: 25 },
    { header: 'Custom Field 2', key: 'customField2', width: 15 },
    { header: 'Custom Field 3', key: 'customField3', width: 15 },
  ];

  this.worksheet.columns = columns;
  this.styleHeaderRow();
}
```

Update `mapDataToRow` method:

```javascript
mapDataToRow(extractedData, filename) {
  return {
    // Existing mappings...

    // Add your custom mappings
    customField1: extractedData.customField1,
    customField2: extractedData.customField2,
    customField3: this.formatDate(extractedData.customField3),
  };
}
```

#### Step 4: Update Batch Processor

Edit `backend/services/batchProcessor.js`:

Update `storeExtractedData` method to include new fields:

```javascript
async storeExtractedData(batchId, pdfRecordId, data, filename) {
  const insertQuery = `
    INSERT INTO invoice_data (
      pdf_record_id, batch_id, filename,
      /* existing fields */,
      custom_field_1, custom_field_2, custom_field_3
    ) VALUES (?, ?, ?, /* ... */, ?, ?, ?)
  `;

  const values = [
    // Existing values...
    data.customField1 || null,
    data.customField2 || null,
    data.customField3 || null,
  ];

  await db.query(insertQuery, values);
}
```

#### Step 5: Test Changes

```bash
# Restart backend
cd backend
npm run dev

# Upload test PDF and verify new fields appear in Excel
```

### Regex Pattern Examples

#### Common Patterns

```javascript
// Invoice number (alphanumeric)
/Invoice(?:\s*(?:No|Number))?[:.\\s]*([A-Z0-9-]+)/i

// Date formats
/Date[:.\\s]*(\\d{2}/\\d{2}/\\d{4})/i           // DD/MM/YYYY
/Date[:.\\s]*(\\d{2}\\.\\d{2}\\.\\d{4})/i       // DD.MM.YYYY
/Date[:.\\s]*(\\d{4}-\\d{2}-\\d{2})/i           // YYYY-MM-DD

// Currency amounts
/Total[:.\\s]*\\$?([\\d,]+\\.\\d{2})/i          // $1,234.56
/Amount[:.\\s]*Rs\\.?\\s*([\\d,]+\\.\\d{2})/i   // Rs. 1,234.56

// Email
/Email[:.\\s]*([\\w.-]+@[\\w.-]+\\.\\w+)/i

// Phone numbers
/Phone[:.\\s]*(\\+?\\d{1,3}[-.\\s]?\\d{10})/i

// GST/Tax IDs
/GSTIN[:.\\s]*([A-Z0-9]{15})/i

// Multi-line addresses
/Address[:.\\s]*([^]+?)(?=City:|State:|$)/i
```

#### Testing Regex Patterns

Use online tools:
- https://regex101.com/ (Best for testing)
- https://regexr.com/
- https://www.regextester.com/

---

## 2. Adding Support for New Vendors

### Step-by-Step Guide

#### Step 1: Analyze the New Vendor's PDF Format

1. Get a sample PDF from the new vendor
2. Open it and identify:
   - Invoice number format and location
   - Date formats
   - Amount locations
   - Company information structure
   - Unique identifiers

3. Extract text to understand structure:

```javascript
// Create a test script: test-vendor.js
const pdfParse = require('pdf-parse');
const fs = require('fs');

const dataBuffer = fs.readFileSync('new-vendor-invoice.pdf');
pdfParse(dataBuffer).then(data => {
  console.log(data.text);
});
```

Run:
```bash
node test-vendor.js > vendor-text.txt
```

#### Step 2: Create Extraction Template

Based on the text structure, create a template:

```json
{
  "templateName": "New Vendor Template",
  "vendorName": "New Vendor Inc",
  "fieldMappings": {
    "invoice_number": {
      "pattern": "INV-[0-9]{6}",
      "required": true
    },
    "invoice_date": {
      "pattern": "Invoice Date: (\\d{2}/\\d{2}/\\d{4})",
      "required": true
    },
    "due_date": {
      "pattern": "Due Date: (\\d{2}/\\d{2}/\\d{4})",
      "required": true
    },
    "subtotal": {
      "pattern": "Subtotal: \\$([\\d,]+\\.\\d{2})",
      "required": true
    },
    "tax": {
      "pattern": "Tax \\(\\d+%\\): \\$([\\d,]+\\.\\d{2})",
      "required": false
    },
    "total": {
      "pattern": "Total: \\$([\\d,]+\\.\\d{2})",
      "required": true
    },
    "vendor_id": {
      "pattern": "Vendor ID: ([A-Z0-9]+)",
      "required": false
    },
    "customer_name": {
      "pattern": "Bill To:\\s*([^\\n]+)",
      "required": true
    },
    "customer_address": {
      "pattern": "Bill To:[^\\n]+\\n([^]+?)(?=Invoice Number:|$)",
      "required": false
    }
  },
  "isDefault": false
}
```

#### Step 3: Test Extraction

**Option A: Via UI**

1. Create template in UI (Templates page)
2. Upload test PDF
3. Select the new template
4. Process and verify extraction

**Option B: Via API**

```bash
curl -X POST http://localhost:5000/api/templates \
  -H "Content-Type: application/json" \
  -d @new-vendor-template.json
```

#### Step 4: Create Vendor-Specific Extraction Logic (Optional)

If the vendor has complex patterns, create a dedicated parser:

Create `backend/services/parsers/newVendorParser.js`:

```javascript
class NewVendorParser {
  static canParse(pdfText) {
    // Detect if PDF is from this vendor
    return pdfText.includes('New Vendor Inc') ||
           pdfText.match(/INV-[0-9]{6}/);
  }

  static extract(pdfText) {
    const data = {};

    // Custom extraction logic
    const invoiceMatch = pdfText.match(/Invoice Number:\s*([A-Z0-9-]+)/);
    if (invoiceMatch) data.invoiceNumber = invoiceMatch[1];

    const dateMatch = pdfText.match(/Date:\s*(\d{2}\/\d{2}\/\d{4})/);
    if (dateMatch) data.invoiceDate = this.parseDate(dateMatch[1]);

    // Extract line items
    data.lineItems = this.extractLineItems(pdfText);

    // Calculate totals
    data.subtotal = this.calculateSubtotal(data.lineItems);

    return data;
  }

  static parseDate(dateStr) {
    // Convert MM/DD/YYYY to YYYY-MM-DD
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  static extractLineItems(text) {
    // Extract table of line items
    const items = [];
    const itemPattern = /Item:\s*([^\\n]+).*?Qty:\s*(\\d+).*?Price:\s*\\$([\\d,]+\\.\\d{2})/g;

    let match;
    while ((match = itemPattern.exec(text)) !== null) {
      items.push({
        description: match[1].trim(),
        quantity: parseInt(match[2]),
        price: parseFloat(match[3].replace(/,/g, ''))
      });
    }

    return items;
  }

  static calculateSubtotal(lineItems) {
    return lineItems.reduce((sum, item) =>
      sum + (item.quantity * item.price), 0
    );
  }
}

module.exports = NewVendorParser;
```

#### Step 5: Integrate into Main Parser

Edit `backend/services/pdfParser.js`:

```javascript
const NewVendorParser = require('./parsers/newVendorParser');

class PDFParser {
  async extractInvoiceData(filePath, template = null, useAI = true) {
    const { text, pages } = await this.extractText(filePath);

    // Try vendor-specific parsers first
    if (NewVendorParser.canParse(text)) {
      const extractedData = NewVendorParser.extract(text);
      return {
        success: true,
        data: extractedData,
        metadata: {
          pages,
          extractionMethod: 'NewVendorParser'
        }
      };
    }

    // Fall back to AI or template extraction
    // ... existing code ...
  }
}
```

#### Step 6: Add Vendor to Auto-Detection

Create vendor detection logic in `backend/services/pdfParser.js`:

```javascript
detectVendor(pdfText) {
  const vendors = {
    'vodafone': {
      patterns: [/Vodafone Idea/i, /Vi toll free/i],
      templateId: 1
    },
    'newvendor': {
      patterns: [/New Vendor Inc/i, /INV-[0-9]{6}/],
      templateId: 2
    },
    'anothervendor': {
      patterns: [/Another Vendor/i, /Invoice #AV-/],
      templateId: 3
    }
  };

  for (const [vendor, config] of Object.entries(vendors)) {
    if (config.patterns.some(pattern => pattern.test(pdfText))) {
      return { vendor, templateId: config.templateId };
    }
  }

  return { vendor: 'unknown', templateId: null };
}
```

Use in extraction:

```javascript
async extractInvoiceData(filePath, template = null, useAI = true) {
  const { text } = await this.extractText(filePath);

  // Auto-detect vendor if no template provided
  if (!template) {
    const detection = this.detectVendor(text);
    if (detection.templateId) {
      template = await this.getTemplate(detection.templateId);
    }
  }

  // Continue with extraction...
}
```

#### Step 7: Test with Multiple PDFs

1. Create a test folder with 5-10 PDFs from the new vendor
2. Upload via UI
3. Process batch
4. Verify all extractions are correct
5. Adjust patterns as needed

#### Step 8: Document the New Vendor

Create `docs/vendors/NEW_VENDOR.md`:

```markdown
# New Vendor Inc - Extraction Guide

## PDF Format
- Invoice number: INV-XXXXXX
- Date format: MM/DD/YYYY
- Currency: USD
- Tax format: Percentage-based

## Extracted Fields
- Invoice Number
- Invoice Date
- Due Date
- Subtotal
- Tax Amount
- Total Amount
- Customer Name
- Customer Address
- Vendor ID

## Template ID
Template ID: 2

## Sample Extraction
See: samples/new-vendor-sample.pdf

## Known Issues
- Multi-page invoices may have issues with line items
- Addresses with commas need special handling
```

---

## 3. Performance Optimization

### Database Optimization

#### Step 1: Add Indexes

```sql
-- Connect to MySQL
mysql -u root -p pdf_excel_converter

-- Add indexes for common queries
CREATE INDEX idx_batch_status_created ON upload_batches(status, created_at);
CREATE INDEX idx_pdf_batch_status ON pdf_records(batch_id, status);
CREATE INDEX idx_invoice_batch ON invoice_data(batch_id);
CREATE INDEX idx_invoice_bill_number ON invoice_data(bill_number);
CREATE INDEX idx_invoice_dates ON invoice_data(bill_date, due_date);
CREATE INDEX idx_logs_batch_level ON processing_logs(batch_id, log_level);

-- Analyze tables
ANALYZE TABLE upload_batches;
ANALYZE TABLE pdf_records;
ANALYZE TABLE invoice_data;
```

#### Step 2: Database Configuration

Edit MySQL config (`my.ini` or `my.cnf`):

```ini
[mysqld]
# Increase buffer sizes
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2

# Query cache
query_cache_type = 1
query_cache_size = 256M

# Connection pool
max_connections = 200

# Temp table size
tmp_table_size = 256M
max_heap_table_size = 256M
```

Restart MySQL after changes.

#### Step 3: Optimize Queries

Edit `backend/services/batchProcessor.js`:

Use batch inserts instead of individual inserts:

```javascript
async storeBatchData(invoiceDataArray) {
  const values = invoiceDataArray.map(data => [
    data.pdfRecordId,
    data.batchId,
    data.filename,
    // ... all other fields
  ]);

  const insertQuery = `
    INSERT INTO invoice_data (
      pdf_record_id, batch_id, filename, /* ... */
    ) VALUES ?
  `;

  await db.query(insertQuery, [values]);
}
```

### Application Performance

#### Step 1: Increase Concurrent Processing

Edit `backend/.env`:

```env
# Increase concurrent processes (be careful with system resources)
MAX_CONCURRENT_PROCESSES=10

# Reduce delay between batches
BATCH_PROCESSING_DELAY=50
```

#### Step 2: Implement Caching

Install Redis:
```bash
npm install redis
```

Create cache layer `backend/services/cache.js`:

```javascript
const redis = require('redis');
const client = redis.createClient();

class Cache {
  async get(key) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, data) => {
        if (err) reject(err);
        resolve(data ? JSON.parse(data) : null);
      });
    });
  }

  async set(key, value, ttl = 3600) {
    return new Promise((resolve, reject) => {
      client.setex(key, ttl, JSON.stringify(value), (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  async delete(key) {
    return new Promise((resolve, reject) => {
      client.del(key, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

module.exports = new Cache();
```

Use in templates:

```javascript
// backend/controllers/templateController.js
const cache = require('../services/cache');

static async getAllTemplates(req, res) {
  // Try cache first
  const cached = await cache.get('templates:all');
  if (cached) {
    return res.json({ success: true, data: cached });
  }

  // Query database
  const templates = await db.query('SELECT * FROM field_templates');

  // Cache for 1 hour
  await cache.set('templates:all', templates, 3600);

  res.json({ success: true, data: templates });
}
```

#### Step 3: Optimize PDF Processing

Edit `backend/services/pdfParser.js`:

Add parallel text extraction:

```javascript
const pLimit = require('p-limit');
const limit = pLimit(10); // Process 10 PDFs concurrently

async extractBatch(filePaths) {
  const promises = filePaths.map(filePath =>
    limit(() => this.extractText(filePath))
  );

  return Promise.all(promises);
}
```

#### Step 4: Use Queue System (Advanced)

Install Bull (Redis-based queue):

```bash
npm install bull
```

Create `backend/services/queue.js`:

```javascript
const Queue = require('bull');
const pdfParser = require('./pdfParser');
const db = require('../config/database');

const pdfQueue = new Queue('pdf-processing', {
  redis: {
    host: 'localhost',
    port: 6379
  }
});

// Process jobs
pdfQueue.process(5, async (job) => {
  const { filePath, pdfRecordId, batchId, template, useAI } = job.data;

  const result = await pdfParser.extractInvoiceData(filePath, template, useAI);

  if (result.success) {
    await db.query(
      'UPDATE pdf_records SET status = ?, extracted_data = ? WHERE id = ?',
      ['completed', JSON.stringify(result.data), pdfRecordId]
    );
  } else {
    await db.query(
      'UPDATE pdf_records SET status = ?, error_message = ? WHERE id = ?',
      ['failed', result.error, pdfRecordId]
    );
  }

  return result;
});

// Add job to queue
async function addPdfJob(fileData) {
  await pdfQueue.add(fileData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}

module.exports = { pdfQueue, addPdfJob };
```

Use in batch processor:

```javascript
// backend/services/batchProcessor.js
const { addPdfJob } = require('./queue');

async processBatch(batchId, files, options) {
  // Add all files to queue instead of processing directly
  for (const file of files) {
    await addPdfJob({
      filePath: file.file_path,
      pdfRecordId: file.id,
      batchId,
      template: options.template,
      useAI: options.useAI
    });
  }
}
```

#### Step 5: Frontend Optimization

Edit `frontend/src/pages/BatchDetailsPage.jsx`:

Implement smart refresh:

```javascript
useEffect(() => {
  if (!autoRefresh || !batch) return;

  // Only refresh if processing or pending
  if (batch.status !== 'processing' && batch.status !== 'pending') {
    setAutoRefresh(false);
    return;
  }

  // Dynamic refresh interval based on batch size
  const refreshInterval = batch.total_files > 100 ? 5000 : 3000;

  const interval = setInterval(() => {
    loadBatchDetails();
  }, refreshInterval);

  return () => clearInterval(interval);
}, [batch, autoRefresh]);
```

Add pagination for large record lists:

```javascript
const [page, setPage] = useState(1);
const [perPage] = useState(50);

const paginatedRecords = useMemo(() => {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return pdfRecords.slice(start, end);
}, [pdfRecords, page, perPage]);
```

### Monitoring Performance

Install monitoring:

```bash
npm install express-status-monitor
```

Add to server:

```javascript
// backend/server.js
const monitor = require('express-status-monitor');

app.use(monitor({
  title: 'PDF Converter Monitoring',
  path: '/status',
  spans: [{
    interval: 1,
    retention: 60
  }],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,
    statusCodes: true
  }
}));
```

Access at: `http://localhost:5000/status`

---

## 4. Deployment to Production

### Option 1: Traditional Server Deployment

#### Step 1: Prepare Server

```bash
# Ubuntu/Debian server
sudo apt update
sudo apt install nodejs npm mysql-server nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/pdf-converter
cd /var/www/pdf-converter
```

#### Step 2: Upload Application

```bash
# From your local machine
scp -r PDF_EXCEL_CONVERT_APP user@server:/var/www/pdf-converter

# Or use Git
cd /var/www/pdf-converter
git clone <your-repo-url> .
```

#### Step 3: Configure Production Environment

```bash
cd /var/www/pdf-converter/backend

# Create production .env
cat > .env << EOF
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=pdfconverter
DB_PASSWORD=strong_password_here
DB_NAME=pdf_excel_converter

UPLOAD_DIR=/var/www/pdf-converter/uploads
MAX_FILE_SIZE=10485760
MAX_FILES_PER_BATCH=1000

OPENAI_API_KEY=your_production_key
OPENAI_MODEL=gpt-4-turbo-preview

MAX_CONCURRENT_PROCESSES=5
BATCH_PROCESSING_DELAY=100

ALLOWED_ORIGINS=https://yourdomain.com
EOF

# Set proper permissions
chmod 600 .env
```

#### Step 4: Setup MySQL

```bash
# Create database user
sudo mysql -u root -p << EOF
CREATE DATABASE pdf_excel_converter;
CREATE USER 'pdfconverter'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON pdf_excel_converter.* TO 'pdfconverter'@'localhost';
FLUSH PRIVILEGES;
EOF

# Initialize database
cd /var/www/pdf-converter/backend
npm install
npm run init-db
```

#### Step 5: Build Frontend

```bash
cd /var/www/pdf-converter/frontend

# Create production .env
echo "VITE_API_URL=https://yourdomain.com/api" > .env.production

# Install and build
npm install
npm run build

# This creates frontend/dist folder
```

#### Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/pdf-converter
```

Add configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/pdf-converter/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # File upload settings
        client_max_body_size 100M;
    }

    # Uploads (if you want to serve them)
    location /uploads {
        alias /var/www/pdf-converter/backend/uploads;
        internal;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/pdf-converter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### Step 8: Start Backend with PM2

```bash
cd /var/www/pdf-converter/backend

# Start application
pm2 start server.js --name pdf-converter-api

# Setup startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs pdf-converter-api
```

#### Step 9: Setup Firewall

```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

#### Step 10: Setup Backup Script

Create `/var/www/pdf-converter/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pdf-converter"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u pdfconverter -p'strong_password_here' pdf_excel_converter > \
  $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/pdf-converter/backend/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Setup cron:

```bash
chmod +x /var/www/pdf-converter/backup.sh
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/pdf-converter/backup.sh >> /var/log/pdf-converter-backup.log 2>&1
```

### Option 2: Docker Deployment

#### Step 1: Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Create uploads directory
RUN mkdir -p uploads/pdfs uploads/exports

EXPOSE 5000

CMD ["node", "server.js"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf** (`frontend/nginx.conf`):

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 2: Create Docker Compose

**`docker-compose.yml`** (root folder):

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: pdf-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: pdf_excel_converter
      MYSQL_USER: pdfconverter
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    networks:
      - pdf-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: pdf-backend
    environment:
      PORT: 5000
      NODE_ENV: production
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: pdfconverter
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: pdf_excel_converter
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    volumes:
      - uploads:/app/uploads
    ports:
      - "5000:5000"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - pdf-network
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: pdf-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - pdf-network
    restart: unless-stopped

volumes:
  mysql-data:
  uploads:

networks:
  pdf-network:
    driver: bridge
```

**Environment file** (`.env` in root):

```env
DB_ROOT_PASSWORD=strong_root_password
DB_PASSWORD=strong_db_password
OPENAI_API_KEY=your_openai_key
ALLOWED_ORIGINS=http://localhost,https://yourdomain.com
```

#### Step 3: Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Stop and remove volumes (data loss!)
docker-compose down -v
```

#### Step 4: Production Docker Compose with SSL

Use Traefik as reverse proxy with automatic SSL:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=your@email.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    networks:
      - pdf-network

  mysql:
    # ... same as before ...

  backend:
    # ... same as before ...
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`yourdomain.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=myresolver"

  frontend:
    # ... same as before ...
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=myresolver"

volumes:
  mysql-data:
  uploads:

networks:
  pdf-network:
    driver: bridge
```

### Option 3: Cloud Deployment (AWS)

#### Using AWS EC2

**Step 1: Launch EC2 Instance**

1. Choose Ubuntu Server 22.04 LTS
2. Instance type: t3.medium (or larger for production)
3. Configure security group:
   - SSH (22) - Your IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
4. Launch and download key pair

**Step 2: Connect and Setup**

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow traditional server deployment steps above
```

**Step 3: Setup RDS for MySQL**

1. Create RDS MySQL instance
2. Configure security group to allow EC2
3. Update backend .env with RDS endpoint

**Step 4: Setup S3 for File Storage**

Install AWS SDK:

```bash
npm install aws-sdk
```

Create S3 service `backend/services/s3Storage.js`:

```javascript
const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

class S3Storage {
  async uploadFile(filePath, key) {
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileContent
    };

    return s3.upload(params).promise();
  }

  async downloadFile(key, destination) {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key
    };

    const data = await s3.getObject(params).promise();
    fs.writeFileSync(destination, data.Body);
  }

  async deleteFile(key) {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key
    };

    return s3.deleteObject(params).promise();
  }

  getSignedUrl(key, expiresIn = 3600) {
    return s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Expires: expiresIn
    });
  }
}

module.exports = new S3Storage();
```

#### Using Heroku

**Step 1: Prepare Application**

Install Heroku CLI:
```bash
npm install -g heroku
```

Create `Procfile` in root:
```
web: cd backend && npm start
```

**Step 2: Deploy**

```bash
heroku login
heroku create pdf-excel-converter

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=your_key

# Deploy
git push heroku main

# Initialize database
heroku run npm run init-db --app pdf-excel-converter
```

### Monitoring & Maintenance

#### Setup Application Monitoring

Install monitoring tools:

```bash
npm install @sentry/node express-rate-limit
```

Configure Sentry (`backend/server.js`):

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

#### Setup Log Management

Install Winston:

```bash
npm install winston winston-daily-rotate-file
```

Create `backend/config/logger.js`:

```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    fileRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
```

Use throughout application:

```javascript
const logger = require('./config/logger');

logger.info('Processing batch', { batchId: 1 });
logger.error('Processing failed', { error: err.message, batchId: 1 });
```

---

## 5. Feature Modifications

### Adding Email Notifications

#### Step 1: Install Nodemailer

```bash
cd backend
npm install nodemailer
```

#### Step 2: Create Email Service

Create `backend/services/emailService.js`:

```javascript
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendBatchCompletedEmail(userEmail, batchDetails) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: `Batch Processing Completed: ${batchDetails.batch_name}`,
      html: `
        <h2>Your batch processing is complete!</h2>
        <p><strong>Batch Name:</strong> ${batchDetails.batch_name}</p>
        <p><strong>Total Files:</strong> ${batchDetails.total_files}</p>
        <p><strong>Processed:</strong> ${batchDetails.processed_files}</p>
        <p><strong>Failed:</strong> ${batchDetails.failed_files}</p>
        <p>
          <a href="${process.env.APP_URL}/batches/${batchDetails.id}">
            View Batch Details
          </a>
        </p>
        <p>
          <a href="${process.env.APP_URL}/api/batches/${batchDetails.id}/download">
            Download Excel File
          </a>
        </p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${userEmail}`);
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }

  async sendBatchFailedEmail(userEmail, batchDetails, errorMessage) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: `Batch Processing Failed: ${batchDetails.batch_name}`,
      html: `
        <h2>Batch processing encountered an error</h2>
        <p><strong>Batch Name:</strong> ${batchDetails.batch_name}</p>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <p>
          <a href="${process.env.APP_URL}/batches/${batchDetails.id}">
            View Error Details
          </a>
        </p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }
}

module.exports = new EmailService();
```

#### Step 3: Integrate into Batch Processor

Edit `backend/services/batchProcessor.js`:

```javascript
const emailService = require('./emailService');

async processBatch(batchId, files, options = {}) {
  const { userEmail } = options;

  try {
    // ... processing logic ...

    // Send completion email
    if (userEmail) {
      const batch = await this.getBatchStatus(batchId);
      await emailService.sendBatchCompletedEmail(userEmail, batch);
    }

  } catch (error) {
    // Send failure email
    if (userEmail) {
      const batch = await this.getBatchStatus(batchId);
      await emailService.sendBatchFailedEmail(userEmail, batch, error.message);
    }
    throw error;
  }
}
```

#### Step 4: Update UI

Edit `frontend/src/pages/UploadPage.jsx`:

Add email field:

```javascript
const [userEmail, setUserEmail] = useState('');

// In form
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Email (for notifications)
  </label>
  <input
    type="email"
    value={userEmail}
    onChange={(e) => setUserEmail(e.target.value)}
    placeholder="your@email.com"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  />
</div>

// In handleUpload
formData.append('userEmail', userEmail);
```

### Adding User Authentication

#### Step 1: Install Dependencies

```bash
cd backend
npm install jsonwebtoken bcryptjs passport passport-jwt
```

#### Step 2: Create User Schema

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Update batches to link to users
ALTER TABLE upload_batches
ADD COLUMN user_id INT,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

#### Step 3: Create Auth Controller

Create `backend/controllers/authController.js`:

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Check if user exists
      const existing = await db.query(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await db.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );

      // Generate token
      const token = jwt.sign(
        { id: result.insertId, username, email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        token,
        user: { id: result.insertId, username, email }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const users = await db.query(
        'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = users[0];

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  static async verifyToken(req, res) {
    res.json({
      success: true,
      user: req.user
    });
  }
}

module.exports = AuthController;
```

#### Step 4: Create Auth Middleware

Create `backend/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
```

#### Step 5: Protect Routes

Edit `backend/routes/index.js`:

```javascript
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const AuthController = require('../controllers/authController');

// Public routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

router.get('/auth/verify', AuthController.verifyToken);

// Upload routes (authenticated)
router.post('/upload',
  UploadController.uploadMiddleware,
  UploadController.uploadPDFs
);

// Only user's own batches
router.get('/batches', UploadController.getUserBatches);

// Admin only routes
router.delete('/batches/:batchId', requireAdmin, UploadController.deleteBatch);
```

#### Step 6: Update Frontend

Create auth context `frontend/src/contexts/AuthContext.jsx`:

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
    navigate('/upload');
  };

  const register = async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
    navigate('/upload');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

Create login page `frontend/src/pages/LoginPage.jsx`:

```javascript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
```

### Adding Scheduled Processing

#### Step 1: Install node-cron

```bash
cd backend
npm install node-cron
```

#### Step 2: Create Scheduler Service

Create `backend/services/scheduler.js`:

```javascript
const cron = require('node-cron');
const db = require('../config/database');
const batchProcessor = require('./batchProcessor');

class Scheduler {
  constructor() {
    this.jobs = new Map();
  }

  startScheduledBatchProcessing() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled batch check...');
      await this.processScheduledBatches();
    });
  }

  async processScheduledBatches() {
    const scheduled = await db.query(`
      SELECT * FROM upload_batches
      WHERE status = 'scheduled'
      AND scheduled_time <= NOW()
    `);

    for (const batch of scheduled) {
      const files = await db.query(
        'SELECT * FROM pdf_records WHERE batch_id = ?',
        [batch.id]
      );

      await batchProcessor.processBatch(batch.id, files, {
        useAI: batch.use_ai,
        templateId: batch.template_id
      });
    }
  }

  scheduleOnce(batchId, datetime) {
    const cronExpression = this.datetimeToCron(datetime);

    const job = cron.schedule(cronExpression, async () => {
      await this.processBatch(batchId);
      this.jobs.delete(batchId);
    });

    this.jobs.set(batchId, job);
  }

  cancelSchedule(batchId) {
    const job = this.jobs.get(batchId);
    if (job) {
      job.stop();
      this.jobs.delete(batchId);
    }
  }

  datetimeToCron(datetime) {
    const date = new Date(datetime);
    return `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
  }
}

module.exports = new Scheduler();
```

#### Step 3: Start Scheduler

Edit `backend/server.js`:

```javascript
const scheduler = require('./services/scheduler');

const startServer = async () => {
  // ... existing startup code ...

  // Start scheduler
  scheduler.startScheduledBatchProcessing();
  console.log('✓ Scheduler started');

  app.listen(PORT, () => {
    // ...
  });
};
```

---

## Summary

This guide covers:

1. **Field Extraction Customization**
   - UI-based templates
   - Database templates
   - Code-level modifications
   - Regex pattern examples

2. **New Vendor Support**
   - Format analysis
   - Template creation
   - Vendor-specific parsers
   - Auto-detection

3. **Performance Optimization**
   - Database optimization
   - Application performance
   - Caching strategies
   - Queue systems
   - Monitoring

4. **Production Deployment**
   - Traditional server
   - Docker deployment
   - Cloud deployment (AWS, Heroku)
   - SSL configuration
   - Monitoring & backups

5. **Feature Additions**
   - Email notifications
   - User authentication
   - Scheduled processing

Each section provides step-by-step instructions with code examples you can implement immediately.

---

**Need more help?** All code is well-commented and modular for easy modifications!
