const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;

class ExcelGenerator {
  constructor() {
    this.workbook = null;
    this.worksheet = null;
  }

  /**
   * Initialize workbook and worksheet
   */
  initializeWorkbook() {
    this.workbook = new ExcelJS.Workbook();
    this.worksheet = this.workbook.addWorksheet('Invoice Data');

    // Set worksheet properties
    this.worksheet.properties.defaultRowHeight = 15;
  }

  /**
   * Define column headers based on the template
   */
  defineColumns(customFields = null) {
    const defaultColumns = [
      { header: 'Filename', key: 'filename', width: 25 },
      { header: 'Bill Date', key: 'billDate', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Bill ID', key: 'billId', width: 20 },
      { header: 'Vendor Name', key: 'vendorName', width: 25 },
      { header: 'Payment Terms Label', key: 'paymentTermsLabel', width: 20 },
      { header: 'CF.VENDOR CIRCUIT ID', key: 'vendorCircuitId', width: 25 },
      { header: 'Bill Number', key: 'billNumber', width: 25 },
      { header: 'Purchase Order', key: 'purchaseOrder', width: 25 },
      { header: 'Currency Code', key: 'currencyCode', width: 15 },
      { header: 'Sub Total', key: 'subTotal', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Branch ID', key: 'branchId', width: 15 },
      { header: 'Branch Name', key: 'branchName', width: 25 },
      { header: 'Item Name', key: 'itemName', width: 25 },
      { header: 'Account', key: 'account', width: 20 },
      { header: 'Description', key: 'description', width: 35 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Usage Unit', key: 'usageUnit', width: 15 },
      { header: 'Tax Amount', key: 'taxAmount', width: 15 },
      { header: 'Source of Supply', key: 'sourceOfSupply', width: 20 },
      { header: 'Destination of Supply', key: 'destinationOfSupply', width: 20 },
      { header: 'GST Identification Number (GSTIN)', key: 'gstin', width: 25 },
      { header: 'Line Item Location Name', key: 'lineItemLocationName', width: 25 },
      { header: 'GSTIN_ISD/UIN No', key: 'gstinIsdUin', width: 25 },
      { header: 'HSN/SAC', key: 'hsnSac', width: 15 },
      { header: 'Purchase Order Number', key: 'purchaseOrderNumber', width: 25 },
      { header: 'Tax Name', key: 'taxName', width: 15 },
      { header: 'Tax Percentage', key: 'taxPercentage', width: 15 },
      { header: 'Item Type', key: 'itemType', width: 15 },
      { header: 'CGST Rate %', key: 'cgstRate', width: 12 },
      { header: 'SGST Rate %', key: 'sgstRate', width: 12 },
      { header: 'IGST Rate %', key: 'igstRate', width: 12 },
      { header: 'CGST (FCY)', key: 'cgstFcy', width: 15 },
      { header: 'SGST (FCY)', key: 'sgstFcy', width: 15 },
      { header: 'IGST (FCY)', key: 'igstFcy', width: 15 },
      { header: 'CGST', key: 'cgst', width: 15 },
      { header: 'SGST', key: 'sgst', width: 15 },
      { header: 'IGST', key: 'igst', width: 15 },
      { header: 'CF.Round Off', key: 'roundOff', width: 12 },
      { header: 'CF.PO ARC VALUE - Rs', key: 'poArcValue', width: 18 },
      { header: 'Charges of the Periods', key: 'chargesOfPeriods', width: 25 },
      { header: 'CF.Bandwidth (Mbps)', key: 'bandwidthMbps', width: 18 },
      { header: 'Relationship Number', key: 'relationshipNumber', width: 20 },
      { header: 'Control Number', key: 'controlNumber', width: 18 },
      { header: 'Circuit ID', key: 'circuitId', width: 25 },
      { header: 'Company Name', key: 'companyName', width: 30 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'State', key: 'state', width: 20 },
      { header: 'PIN', key: 'pin', width: 12 },
      { header: 'Contact Person', key: 'contactPerson', width: 25 },
      { header: 'Contact Number', key: 'contactNumber', width: 18 },
      { header: 'Installation Address', key: 'installationAddress', width: 40 }
    ];

    // If custom fields are provided, merge them
    const columns = customFields || defaultColumns;
    this.worksheet.columns = columns;

    // Style header row
    this.styleHeaderRow();
  }

  /**
   * Style the header row
   */
  styleHeaderRow() {
    const headerRow = this.worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;
  }

  /**
   * Map extracted data to Excel row format
   */
  mapDataToRow(extractedData, filename) {
    return {
      filename: filename || extractedData.filename,
      billDate: this.formatDate(extractedData.billDate),
      dueDate: this.formatDate(extractedData.dueDate),
      billId: extractedData.invoiceNumber || extractedData.billId,
      vendorName: extractedData.vendorName || 'Vodafone Idea',
      paymentTermsLabel: extractedData.paymentTermsLabel || 'Net 30',
      vendorCircuitId: extractedData.circuitId,
      billNumber: extractedData.invoiceNumber,
      purchaseOrder: extractedData.poNumber || extractedData.purchaseOrder,
      currencyCode: extractedData.currencyCode || 'INR',
      subTotal: extractedData.subTotal,
      total: extractedData.totalPayable || extractedData.total,
      branchId: extractedData.branchId || '1',
      branchName: extractedData.branchName || 'Main Branch',
      itemName: extractedData.itemName || 'MPLS Service',
      account: extractedData.account,
      description: extractedData.description || extractedData.planName,
      quantity: extractedData.quantity || 1,
      usageUnit: extractedData.usageUnit || 'Month',
      taxAmount: extractedData.tax || extractedData.taxAmount,
      sourceOfSupply: extractedData.sourceOfSupply || 'India',
      destinationOfSupply: extractedData.destinationOfSupply || 'India',
      gstin: extractedData.gstin,
      lineItemLocationName: extractedData.lineItemLocationName,
      gstinIsdUin: extractedData.gstinIsdUin,
      hsnSac: extractedData.hsnSac || '998414',
      purchaseOrderNumber: extractedData.poNumber,
      taxName: extractedData.taxName || 'GST',
      taxPercentage: extractedData.taxPercentage || 0.18,
      itemType: extractedData.itemType || 'Service',
      cgstRate: extractedData.cgst || 0.09,
      sgstRate: extractedData.sgst || 0.09,
      igstRate: extractedData.igstRate || 0,
      cgstFcy: extractedData.cgstFcy,
      sgstFcy: extractedData.sgstFcy,
      igstFcy: extractedData.igstFcy,
      cgst: extractedData.cgstAmount,
      sgst: extractedData.sgstAmount,
      igst: extractedData.igstAmount,
      roundOff: extractedData.roundOff,
      poArcValue: extractedData.poArcValue || extractedData.subTotal,
      chargesOfPeriods: extractedData.chargesOfPeriods,
      bandwidthMbps: extractedData.bandwidth || extractedData.bandwidthMbps,
      relationshipNumber: extractedData.relationshipNumber,
      controlNumber: extractedData.controlNumber,
      circuitId: extractedData.circuitId,
      companyName: extractedData.companyName,
      city: extractedData.city,
      state: extractedData.state,
      pin: extractedData.pin,
      contactPerson: extractedData.contactPerson,
      contactNumber: extractedData.contactNumber,
      installationAddress: extractedData.installationAddress
    };
  }

  /**
   * Format date for Excel
   */
  formatDate(dateValue) {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;

    // Parse date string (YYYY-MM-DD format)
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? dateValue : parsed;
  }

  /**
   * Add data row to worksheet
   */
  addDataRow(rowData) {
    const row = this.worksheet.addRow(rowData);

    // Apply number format to currency columns
    const currencyColumns = ['K', 'L', 'T', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AO'];
    currencyColumns.forEach(col => {
      const cell = row.getCell(col);
      if (cell.value && typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
      }
    });

    // Apply date format
    const dateColumns = ['B', 'C'];
    dateColumns.forEach(col => {
      const cell = row.getCell(col);
      if (cell.value instanceof Date) {
        cell.numFmt = 'dd.mm.yyyy';
      }
    });

    return row;
  }

  /**
   * Generate Excel file from invoice data array
   */
  async generateExcel(invoiceDataArray, outputPath, customColumns = null) {
    try {
      this.initializeWorkbook();
      this.defineColumns(customColumns);

      // Add all data rows
      for (const invoiceData of invoiceDataArray) {
        const rowData = this.mapDataToRow(
          invoiceData.extractedData || invoiceData,
          invoiceData.filename
        );
        this.addDataRow(rowData);
      }

      // Auto-filter on header row
      this.worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + this.worksheet.columnCount)}1`
      };

      // Freeze header row
      this.worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ];

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Save workbook
      await this.workbook.xlsx.writeFile(outputPath);

      return {
        success: true,
        filePath: outputPath,
        rowCount: invoiceDataArray.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate Excel from database records
   */
  async generateFromDatabase(invoiceRecords, outputPath, customColumns = null) {
    const invoiceDataArray = invoiceRecords.map(record => ({
      filename: record.filename,
      extractedData: JSON.parse(record.extracted_data || '{}')
    }));

    return this.generateExcel(invoiceDataArray, outputPath, customColumns);
  }
}

module.exports = new ExcelGenerator();
