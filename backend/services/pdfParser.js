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
      billDate: /(?:Bill|Invoice)\s*(?:Cycle\s*)?Date[:.\s]*(\d{2}\.?\d{2}\.?\d{2,4})/i,
      dueDate: /Due\s*[Dd]ate[:.\s]*(\d{2}\.?\d{2}\.?\d{2,4})/i,
      relationshipNumber: /Relationship\s*(?:no|number)?[:.\s]*(\d+)/i,

      // Amounts
      totalPayable: /TOTAL\s*PAYABLE\s*([0-9,]+\.?\d{0,2})/i,
      subTotal: /(?:Sub\s*total|Total\s*taxable\s*charges)\s*([0-9,]+\.?\d{0,2})/i,
      tax: /Tax\s*([0-9,]+\.?\d{0,2})/i,

      // Company details
      companyName: /Company\s*Name\s*[:.]?\s*\.?\s*([^\n]+)/i,
      gstin: /GSTIN(?:\/GSTIN_ISD)?(?:\/UIN)?(?:\s*No)?[:.\s]*([A-Z0-9]{15})/i,

      // Service details
      circuitId: /Circuit\s*ID\s*[:.]?\s*([A-Z0-9]+)/i,
      controlNumber: /Control\s*Number\s*[:.]?\s*(\d+)/i,
      bandwidth: /(?:CIR\s*)?Bandwidth\s*[:.]?\s*(\d+)\s*Mbps/i,
      planName: /Plan\s*Name\s*[:.]?\s*([^\n]+)/i,

      // Tax details
      cgst: /Central\s*GST\s*@\s*([0-9.]+)%/i,
      sgst: /State\s*GST\s*@\s*([0-9.]+)%/i,

      // Purchase order
      poNumber: /(?:PO\s*Number|Purchase\s*Order)\s*[:.]?\s*([A-Z0-9\s-]+)/i,

      // Charges
      recurringCharges: /Recurring\s*charges\s*([0-9,]+\.?\d{0,2})/i,
      oneTimeCharges: /One\s*time\s*charges\s*([0-9,]+\.?\d{0,2})/i,
      usageCharges: /Usage\s*charges\s*([0-9,]+\.?\d{0,2})/i,
    };

    const extracted = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      extracted[key] = match ? match[1].trim() : null;
    }

    // Parse addresses
    extracted.shipToAddress = this.extractAddress(text, 'Ship To');
    extracted.billToAddress = this.extractAddress(text, 'Bill To');
    extracted.installationAddress = this.extractAddress(text, 'Installation Address');

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
      if (extractedData.billDate) {
        extractedData.billDate = this.formatDate(extractedData.billDate);
      }
      if (extractedData.dueDate) {
        extractedData.dueDate = this.formatDate(extractedData.dueDate);
      }

      // Clean numeric values
      const numericFields = ['totalPayable', 'subTotal', 'tax', 'bandwidth',
        'recurringCharges', 'oneTimeCharges', 'usageCharges', 'cgst', 'sgst'];

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
