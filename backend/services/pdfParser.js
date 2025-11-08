const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class PDFParser {
  /**
   * Extract text from PDF file
   */
  async extractText(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract structured data using AI (GPT-4)
   */
  async extractWithAI(pdfText, template = null) {
    try {
      const systemPrompt = `You are an expert at extracting structured data from invoices and bills.
Extract the following information from the provided invoice text and return it as a JSON object.
Be precise and extract exact values as they appear in the document.`;

      const userPrompt = `Extract all relevant invoice data from the following text. Include:
- Invoice details (invoice number, date, due date, amounts)
- Company/vendor information
- Customer information
- Line items and charges
- Tax information (GST, CGST, SGST, IGST)
- Payment details
- Any circuit/service specific information

Text:
${pdfText}

Return ONLY a valid JSON object with the extracted data. Use null for missing fields.`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });

      const extractedData = JSON.parse(completion.choices[0].message.content);
      return extractedData;
    } catch (error) {
      console.error('AI extraction error:', error.message);
      // Fallback to regex-based extraction if AI fails
      return this.extractWithRegex(pdfText);
    }
  }

  /**
   * Extract data using regex patterns (fallback method)
   */
  extractWithRegex(text) {
    const patterns = {
      // Invoice details
      invoiceNumber: /Invoice\s*(?:No|Number)?[:.\s]*([A-Z0-9]+)/i,
      invoiceRefNo: /Invoice\s*Ref\s*No[:.\s]*([a-zA-Z0-9]+)/i,
      billDate: /(?:Bill|Invoice)\s*(?:Cycle\s*)?Date[:.\s]*(\d{2}\.?\d{2}\.?\d{2,4})/i,
      dueDate: /Due\s*[Dd]ate[:.\s]*(\d{2}\.?\d{2}\.?\d{2,4})/i,
      relationshipNumber: /Relationship\s*(?:no|number)?[:.\s]*(\d+)/i,
      invoiceType: /(TAX\s*INVOICE)/i,

      // Amounts
      totalPayable: /TOTAL\s*PAYABLE\s*([0-9,]+\.?\d{0,2})/i,
      subTotal: /(?:Sub\s*total|Total\s*taxable\s*charges)\s*([0-9,]+\.?\d{0,2})/i,
      tax: /\(\+\)\s*Tax\s*([0-9,]+\.?\d{0,2})/i,
      previousOutstanding: /(?:Your\s*previous\s*outstanding\s*balance|Amount\s*due).*?(?:INR|Rs\.?)[:.\s]*([0-9,]+\.?\d{0,2})/i,
      amountInWords: /Amount\s*in\s*words[:.\s]*([^\n]+)/i,
      totalValueOfServices: /Total\s*value\s*of\s*services\s*([0-9,]+\.?\d{0,2})/i,
      totalTaxableCharges: /Total\s*taxable\s*charges\s*([0-9,]+\.?\d{0,2})/i,
      miscCharges: /Misc\.\s*credits\s*\/\s*charges\s*([0-9,]+\.?\d{0,2})/i,

      // Company details
      companyName: /Company\s*Name\s*[:.]?\s*\.?\s*([^\n]+)/i,
      gstin: /GSTIN(?:\/GSTIN_ISD)?(?:\/UIN)?(?:\s*No)?[:.\s]*([A-Z0-9]{15})/i,
      contactPerson: /Kind\s*Attn[:.\s]*([^\n]+)/i,
      contactNumber: /Contact\s*No[:.\s]*([0-9]+)/i,
      city: /City[:.\s]*([A-Z\s]+)/i,
      state: /State[:.\s]*([A-Z\s]+)/i,
      pin: /Pin[:.\s]*(\d{6})/i,

      // Service details
      circuitId: /Circuit\s*ID\s*[:.]?\s*([A-Z0-9]+)/i,
      controlNumber: /Control\s*Number\s*[:.]?\s*(\d+)/i,
      bandwidth: /(?:CIR\s*)?Bandwidth\s*[:.]?\s*(\d+)\s*Mbps/i,
      portBandwidth: /Port\s*Bandwidth\s*[:.]?\s*([^\n]+)/i,
      planName: /Plan\s*Name\s*[:.]?\s*([^\n]+)/i,
      productFlavor: /Product\s*Flavor\s*[:.]?\s*([^\n]+)/i,
      billingPeriodicity: /Billing\s*Periodicity\s*[:.]?\s*([^\n]+)/i,
      vpnTopology: /VPN\s*Topology\s*[:.]?\s*([^\n]+)/i,
      typeOfSite: /Type\s*of\s*site\s*[:.]?\s*([^\n]+)/i,
      annualCharges: /Annual\s*Charges\s*Service\s*Rental.*?[:.\s]*([0-9,]+\.?\d{0,2})/i,
      natureOfService: /Nature\s*of\s*Service[:.\s]*([^\n]+)/i,

      // Service Period
      servicePeriod: /Charges\s*for\s*the\s*period\s*(\d{2}\.\d{2}\.\d{2})\s*to\s*(\d{2}\.\d{2}\.\d{2})/i,

      // Tax details
      cgst: /Central\s*GST\s*@\s*([0-9.]+)%/i,
      sgst: /State\s*GST\s*@\s*([0-9.]+)%/i,
      igst: /IGST\s*@\s*([0-9.]+)%/i,
      cgstAmount: /Central\s*GST\s*@\s*[0-9.]+%\s*([0-9,]+\.?\d{0,2})/i,
      sgstAmount: /State\s*GST\s*@\s*[0-9.]+%\s*([0-9,]+\.?\d{0,2})/i,
      igstAmount: /IGST\s*@\s*[0-9.]+%\s*([0-9,]+\.?\d{0,2})/i,
      totalTaxAmount: /Total\s*taxes\s*([0-9,]+\.?\d{0,2})/i,
      reverseCharge: /No\s*Tax\s*is\s*payable\s*under\s*reverse\s*charge/i,

      // Vendor Information
      vendorName: /Vodafone\s*Idea/i,
      vendorPan: /PAN\s*No[:.\s]*([A-Z0-9]{10})/i,
      vendorGstin: /Vodafone\s*Idea\s*GSTIN[:.\s]*([A-Z0-9]{15})/i,
      vendorCin: /CIN[:-]([A-Z0-9]+)/i,
      vendorEmail: /vbsbillingsupport\.in@vodafoneidea\.com/i,
      vendorPhone: /(\d{12})\s*\(Vi\s*toll\s*free\)/i,
      vendorChargeablePhone: /(\+91\s*\d{10})\s*\(Chargeable\)/i,
      vendorBusinessAddress: /Business\s*Office\s*Address[:.\s]*([^\n]+(?:\n[^\n]+)?)/i,
      vendorRegisteredAddress: /Regd\s*Office\s*Address[:.\s]*([^\n]+(?:\n[^\n]+)?)/i,

      // Place of Supply
      placeOfSupply: /Place\s*of\s*Supply\s*\(State\)[:.\s]*([^\n]+)/i,
      stateCode: /State\s*Code[:.\s]*(\d{2})/i,

      // Purchase order
      poNumber: /(?:PO\s*Number|Purchase\s*Order)\s*[:.]?\s*([A-Z0-9\s-]+)/i,
      poDate: /PO\s*Date\s*[:.]?\s*(\d{2}\.\d{2}\.\d{2,4})/i,

      // Charges
      recurringCharges: /Recurring\s*charges\s*([0-9,]+\.?\d{0,2})/i,
      oneTimeCharges: /One\s*time\s*charges\s*([0-9,]+\.?\d{0,2})/i,
      usageCharges: /Usage\s*charges\s*([0-9,]+\.?\d{0,2})/i,

      // Bank Details
      bankName: /Bank\s*Name[:.\s]*(State\s*Bank\s*of\s*India)/i,
      bankAccountNumber: /Account\s*no[:.\s]*(\d+)/i,
      ifscCode: /(?:RTGS\/)?IFSC\s*Code[:.\s]*([A-Z0-9]+)/i,
      swiftCode: /Swift\s*Code[:.\s]*([A-Z0-9]+)/i,
      micrCode: /MICR\s*Code[:.\s]*([A-Z0-9]+|NA)/i,
      bankBranchAddress: /Bank\s*branch\s*address[:.\s]*([^\n]+)/i,

      // HSN/SAC
      hsnCode: /HSN\s*Code[:.\s]*(\d+)/i,
    };

    const extracted = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (key === 'servicePeriod' && match) {
        // Special handling for service period (two dates)
        extracted.servicePeriodFrom = match[1] ? match[1].trim() : null;
        extracted.servicePeriodTo = match[2] ? match[2].trim() : null;
      } else if (key === 'reverseCharge') {
        // Boolean field
        extracted[key] = match ? false : null; // "No Tax is payable" means false
      } else if (key === 'vendorEmail' || key === 'vendorPhone' || key === 'vendorChargeablePhone') {
        // Direct values without capture groups
        if (match) {
          extracted[key] = match[0] ? match[0].trim() : null;
        } else {
          extracted[key] = null;
        }
      } else {
        extracted[key] = match ? match[1].trim() : null;
      }
    }

    // Parse addresses
    extracted.shipToAddress = this.extractAddress(text, 'Ship To');
    extracted.billToAddress = this.extractAddress(text, 'Bill To');
    extracted.installationAddress = this.extractAddress(text, 'Installation Address');

    // Set vendor name default if found
    if (!extracted.vendorName && text.match(/Vodafone\s*Idea/i)) {
      extracted.vendorName = 'Vodafone Idea';
    }

    // Extract vendor email if pattern didn't work
    if (!extracted.vendorEmail && text.includes('vbsbillingsupport.in@vodafoneidea.com')) {
      extracted.vendorEmail = 'vbsbillingsupport.in@vodafoneidea.com';
    }

    return extracted;
  }

  /**
   * Extract address from text
   */
  extractAddress(text, label) {
    const addressPattern = new RegExp(`${label}\\s*[:.]?([^]+?)(?=Bill To|Ship To|City:|Description|$)`, 'i');
    const match = text.match(addressPattern);
    if (match) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
    return null;
  }

  /**
   * Parse extracted data based on template
   */
  async parseWithTemplate(pdfText, template) {
    const extractedData = {};

    if (!template || !template.field_mappings) {
      return this.extractWithRegex(pdfText);
    }

    const mappings = typeof template.field_mappings === 'string'
      ? JSON.parse(template.field_mappings)
      : template.field_mappings;

    for (const [fieldName, config] of Object.entries(mappings)) {
      if (config.pattern) {
        const regex = new RegExp(config.pattern, 'i');
        const match = pdfText.match(regex);
        extractedData[fieldName] = match ? match[1].trim() : null;
      }
    }

    return extractedData;
  }

  /**
   * Format date strings
   */
  formatDate(dateStr) {
    if (!dateStr) return null;

    // Handle DD.MM.YY format
    const match1 = dateStr.match(/(\d{2})\.(\d{2})\.(\d{2})$/);
    if (match1) {
      const year = parseInt(match1[3]) > 50 ? `19${match1[3]}` : `20${match1[3]}`;
      return `${year}-${match1[2]}-${match1[1]}`;
    }

    // Handle DD.MM.YYYY format
    const match2 = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (match2) {
      return `${match2[3]}-${match2[2]}-${match2[1]}`;
    }

    return dateStr;
  }

  /**
   * Clean numeric values
   */
  cleanNumeric(value) {
    if (!value) return null;
    return parseFloat(value.toString().replace(/,/g, ''));
  }

  /**
   * Main extraction method
   */
  async extractInvoiceData(filePath, template = null, useAI = true) {
    const startTime = Date.now();

    try {
      // Extract text from PDF
      const { text, pages } = await this.extractText(filePath);

      let extractedData;

      // Try AI extraction first if enabled
      if (useAI && process.env.OPENAI_API_KEY) {
        try {
          extractedData = await this.extractWithAI(text, template);
        } catch (aiError) {
          console.warn('AI extraction failed, falling back to regex:', aiError.message);
          extractedData = template
            ? await this.parseWithTemplate(text, template)
            : this.extractWithRegex(text);
        }
      } else if (template) {
        extractedData = await this.parseWithTemplate(text, template);
      } else {
        extractedData = this.extractWithRegex(text);
      }

      // Format dates
      const dateFields = ['billDate', 'dueDate', 'poDate', 'servicePeriodFrom', 'servicePeriodTo'];
      for (const field of dateFields) {
        if (extractedData[field]) {
          extractedData[field] = this.formatDate(extractedData[field]);
        }
      }

      // Clean numeric values
      const numericFields = [
        'totalPayable', 'subTotal', 'tax', 'bandwidth',
        'recurringCharges', 'oneTimeCharges', 'usageCharges',
        'cgst', 'sgst', 'igst',
        'cgstAmount', 'sgstAmount', 'igstAmount', 'totalTaxAmount',
        'previousOutstanding', 'totalValueOfServices', 'totalTaxableCharges',
        'miscCharges', 'annualCharges', 'poArcValue'
      ];

      for (const field of numericFields) {
        if (extractedData[field]) {
          extractedData[field] = this.cleanNumeric(extractedData[field]);
        }
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: extractedData,
        metadata: {
          pages,
          processingTime,
          extractionMethod: useAI ? 'AI' : (template ? 'Template' : 'Regex')
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: {
          processingTime: Date.now() - startTime
        }
      };
    }
  }
}

module.exports = new PDFParser();
