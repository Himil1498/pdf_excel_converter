/**
 * Comprehensive Vendor Testing Script
 * Tests PDF upload, processing, and data extraction for all vendors
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5001/api';
const VENDOR_CONFIGS = [
  {
    name: 'Vodafone Idea Limited',
    type: 'vodafone',
    pdfDir: './Vendors/Vodafone Vendor',
    testCount: 3
  },
  {
    name: 'Tata Teleservices',
    type: 'tata',
    pdfDir: './Vendors/Tata Vendor',
    testCount: 3
  },
  {
    name: 'Bharti Airtel Limited',
    type: 'airtel',
    pdfDir: './Vendors/AIRTEL Vendor',
    testCount: 3
  }
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadPDFs(vendorType, pdfFiles, batchName) {
  const formData = new FormData();

  pdfFiles.forEach(filePath => {
    formData.append('pdfs', fs.createReadStream(filePath));
  });

  formData.append('batchName', batchName);
  formData.append('vendorType', vendorType);
  formData.append('useAI', 'false');
  formData.append('includeBlankColumns', 'true');

  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

async function getBatchStatus(batchId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/batches/${batchId}/status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

async function getBatchDetails(batchId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/batches/${batchId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

async function waitForProcessing(batchId, maxWaitTime = 300000) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getBatchStatus(batchId);
    const statusData = status.data || status;

    if (statusData.status === 'completed') {
      return statusData;
    } else if (statusData.status === 'failed') {
      throw new Error('Batch processing failed');
    }

    // Show progress
    const progress = Math.round((statusData.processed_files / statusData.total_files) * 100);
    process.stdout.write(`\r   Processing: ${progress}% (${statusData.processed_files}/${statusData.total_files}) `);

    await sleep(2000); // Check every 2 seconds
  }

  throw new Error('Processing timeout');
}

async function analyzeExtractedData(batchId, vendorName) {
  const details = await getBatchDetails(batchId);
  const detailsData = details.data || details;
  const records = detailsData.pdfRecords || detailsData.pdf_records || [];

  const analysis = {
    totalRecords: records.length,
    successfulExtractions: 0,
    failedExtractions: 0,
    fieldsExtracted: {},
    sampleData: null
  };

  records.forEach(record => {
    if (record.status === 'completed') {
      analysis.successfulExtractions++;

      // Count fields extracted
      const data = record.extracted_data || {};
      Object.keys(data).forEach(key => {
        if (data[key] && data[key] !== '' && data[key] !== null) {
          analysis.fieldsExtracted[key] = (analysis.fieldsExtracted[key] || 0) + 1;
        }
      });

      // Store first successful extraction as sample
      if (!analysis.sampleData) {
        analysis.sampleData = data;
      }
    } else {
      analysis.failedExtractions++;
    }
  });

  return analysis;
}

async function testVendor(config) {
  log(`\n${'='.repeat(80)}`, 'cyan');
  log(`Testing: ${config.name} (${config.type})`, 'cyan');
  log('='.repeat(80), 'cyan');

  try {
    // Check if directory exists
    if (!fs.existsSync(config.pdfDir)) {
      log(`❌ Directory not found: ${config.pdfDir}`, 'red');
      return { vendor: config.name, status: 'SKIPPED', reason: 'No test PDFs available' };
    }

    // Get PDF files
    const allPdfs = fs.readdirSync(config.pdfDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(config.pdfDir, file));

    if (allPdfs.length === 0) {
      log(`❌ No PDF files found in ${config.pdfDir}`, 'red');
      return { vendor: config.name, status: 'SKIPPED', reason: 'No PDF files found' };
    }

    // Select test PDFs
    const testPdfs = allPdfs.slice(0, Math.min(config.testCount, allPdfs.length));
    log(`📄 Found ${allPdfs.length} PDFs, testing ${testPdfs.length} files`, 'blue');
    testPdfs.forEach((pdf, i) => log(`   ${i + 1}. ${path.basename(pdf)}`, 'blue'));

    // Upload PDFs
    log(`\n⬆️  Uploading PDFs...`, 'yellow');
    const batchName = `Test_${config.name}_${Date.now()}`;
    const uploadResult = await uploadPDFs(config.type, testPdfs, batchName);

    if (!uploadResult.success) {
      log(`❌ Upload failed: ${uploadResult.message}`, 'red');
      return { vendor: config.name, status: 'FAILED', reason: 'Upload failed' };
    }

    const batchId = uploadResult.batchId;
    log(`✅ Upload successful! Batch ID: ${batchId}`, 'green');

    // Wait for processing
    log(`\n⏳ Waiting for processing to complete...`, 'yellow');
    const processResult = await waitForProcessing(batchId);
    console.log(''); // New line after progress
    log(`✅ Processing completed!`, 'green');
    log(`   Total: ${processResult.total_files} | Processed: ${processResult.processed_files} | Failed: ${processResult.failed_files}`, 'blue');

    // Analyze extracted data
    log(`\n🔍 Analyzing extracted data...`, 'yellow');
    const analysis = await analyzeExtractedData(batchId, config.name);

    log(`\n📊 Extraction Analysis:`, 'magenta');
    log(`   Successful: ${analysis.successfulExtractions}/${analysis.totalRecords}`, 'green');
    log(`   Failed: ${analysis.failedExtractions}/${analysis.totalRecords}`, analysis.failedExtractions > 0 ? 'red' : 'green');

    if (Object.keys(analysis.fieldsExtracted).length > 0) {
      log(`\n   📋 Fields Extracted (count):`, 'blue');
      const sortedFields = Object.entries(analysis.fieldsExtracted)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15); // Show top 15 fields

      sortedFields.forEach(([field, count]) => {
        log(`      • ${field}: ${count}/${analysis.totalRecords}`, 'blue');
      });
    }

    if (analysis.sampleData) {
      log(`\n   📝 Sample Data (first record):`, 'cyan');
      const importantFields = [
        'invoice_number', 'bill_number', 'bill_date', 'due_date',
        'vendor_name', 'total', 'total_amount', 'subtotal',
        'cgst_amount', 'sgst_amount', 'igst_amount',
        'circuit_id', 'relationship_number'
      ];

      importantFields.forEach(field => {
        const value = analysis.sampleData[field];
        if (value !== undefined && value !== null && value !== '') {
          log(`      • ${field}: ${value}`, 'cyan');
        }
      });
    }

    // Success summary
    const successRate = Math.round((analysis.successfulExtractions / analysis.totalRecords) * 100);
    log(`\n${'─'.repeat(80)}`, 'green');
    log(`✅ ${config.name} - SUCCESS (${successRate}% extraction rate)`, 'green');
    log('─'.repeat(80), 'green');

    return {
      vendor: config.name,
      type: config.type,
      status: 'PASSED',
      batchId,
      filesProcessed: analysis.totalRecords,
      successfulExtractions: analysis.successfulExtractions,
      failedExtractions: analysis.failedExtractions,
      fieldsExtracted: Object.keys(analysis.fieldsExtracted).length,
      successRate
    };

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    log(`─${'─'.repeat(79)}`, 'red');
    return {
      vendor: config.name,
      status: 'FAILED',
      error: error.message
    };
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║        COMPREHENSIVE VENDOR TESTING - PDF TO EXCEL CONVERTER                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════════╝', 'cyan');

  const results = [];

  for (const config of VENDOR_CONFIGS) {
    const result = await testVendor(config);
    results.push(result);
    await sleep(2000); // Brief pause between vendors
  }

  // Final Summary
  log('\n\n╔════════════════════════════════════════════════════════════════════════════════╗', 'magenta');
  log('║                             FINAL TEST SUMMARY                                  ║', 'magenta');
  log('╚════════════════════════════════════════════════════════════════════════════════╝', 'magenta');

  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const skipped = results.filter(r => r.status === 'SKIPPED').length;

  log(`\nTotal Vendors Tested: ${VENDOR_CONFIGS.length}`, 'blue');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`⏭️  Skipped: ${skipped}`, 'yellow');

  log('\n' + '─'.repeat(80), 'blue');
  results.forEach((result, i) => {
    const icon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⏭️';
    const color = result.status === 'PASSED' ? 'green' : result.status === 'FAILED' ? 'red' : 'yellow';

    log(`${icon} ${result.vendor} - ${result.status}`, color);

    if (result.status === 'PASSED') {
      log(`   Files: ${result.filesProcessed} | Success: ${result.successfulExtractions} | Fields: ${result.fieldsExtracted} | Rate: ${result.successRate}%`, 'blue');
    } else if (result.status === 'FAILED') {
      log(`   Error: ${result.error || result.reason}`, 'red');
    } else if (result.status === 'SKIPPED') {
      log(`   Reason: ${result.reason}`, 'yellow');
    }
  });
  log('─'.repeat(80) + '\n', 'blue');

  if (passed === VENDOR_CONFIGS.length) {
    log('🎉 ALL TESTS PASSED! Application is working correctly for all vendors!', 'green');
  } else if (failed > 0) {
    log('⚠️  SOME TESTS FAILED! Please review the errors above.', 'red');
  } else {
    log('ℹ️  Tests completed with some skips. Review results above.', 'yellow');
  }

  log('\n');
}

// Run tests
runAllTests()
  .then(() => {
    log('Test suite completed.', 'green');
    process.exit(0);
  })
  .catch(error => {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
