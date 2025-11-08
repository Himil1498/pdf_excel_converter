# Additional Extractable Fields from Vodafone Invoices

## Currently MISSING Fields (Need to Add):

### Invoice Details:
- ✅ Invoice Ref No (Hash ID) - `6db768f14948b3a68f3acbd335e7e5792`
- ✅ Previous Outstanding Balance - Important for payment tracking
- ✅ Amount in Words - For verification

### Service Details:
- ✅ Billing Periodicity - "Monthly"
- ✅ Service Period From Date - "01.10.25"
- ✅ Service Period To Date - "31.10.25"
- ✅ Annual Charges Service Rental (ARC) - "21,675.00"

### Financial Details (Enhanced):
- ✅ Misc Credits/Charges - Currently shows 0.00 but important
- ✅ CGST Amount (separate from rate) - "162.56"
- ✅ SGST Amount (separate from rate) - "162.56"
- ✅ IGST Amount - For interstate transactions
- ✅ Round Off Amount - For exact calculations

### Vendor Information:
- ✅ CIN Number - "L32100GJ1996PLC030976"
- ✅ Place of Supply State - "Maharashtra"
- ✅ State Code - "27"
- ✅ Business Office Address - Complete address
- ✅ Registered Office Address - Different from business office
- ✅ Vendor Email - "vbsbillingsupport.in@vodafoneidea.com"
- ✅ Vendor Support Phone - "180012155666"
- ✅ Vendor Chargeable Phone - "+91 9920055666"

### Payment Details (Bank Info):
- ✅ Bank Name - "State Bank of India"
- ✅ Bank Account Number - "40824109606"
- ✅ Bank Branch Address - "The Capital, 16th Floor BKC,Bandra East, Dist Mumbai 400051"
- ✅ IFSC Code - "SBIN0016376"
- ✅ RTGS/IFSC Code - "SBININBB796"
- ✅ MICR Code - "NA"
- ✅ Swift Code - "SBININBB796"

### Additional Metadata:
- ✅ Terms & Conditions Text
- ✅ Payment Instructions
- ✅ Invoice Type - "TAX INVOICE"
- ✅ Reverse Charge Applicable - "No"

## Summary of New Fields to Add: 27 Fields

This will increase total extractable fields from ~50 to **~77 fields** for comprehensive invoice data capture.

---

**Next Steps:**
1. Update database schema to include these fields
2. Update PDF parser regex patterns
3. Update Excel generator to include new columns
4. Update frontend forms to display new fields
