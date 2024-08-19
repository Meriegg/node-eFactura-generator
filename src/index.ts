import { create } from 'xmlbuilder2'
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { convertCurrency } from './utils/convert-currency';
import { formatDate } from './utils/format-date';
import { InvoiceTypeCodes, InvoiceTypeCodesDescriptions, TaxDueCodes, TaxDueCodesDescriptions } from './utils/codes';
import type { ConversionRates, Entity_Seller, Entity_Buyer, InvoiceGeneralData, InvoiceLine, InvoiceMonetaryData, InvoicePaymentMeans, InvoiceTaxData, InvoiceTypeCode, TaxDueCode } from "./types";

export class Invoice {
  private invoiceGeneralData: InvoiceGeneralData | null = null;
  private buyer: Entity_Buyer | null = null;
  private seller: Entity_Seller | null = null;
  private invoicePaymentMeans: InvoicePaymentMeans | null = null;
  private invoiceTaxData: InvoiceTaxData | null = null;
  private invoiceMonetaryData: InvoiceMonetaryData | null = null;
  private invoiceLines: InvoiceLine[] | null = null;
  private conversionRates: ConversionRates | null = null;

  constructor() { }

  public setConversionRates(conversionRates: ConversionRates) {
    this.conversionRates = conversionRates;
  }

  public setBuyer(buyer: Entity_Buyer) {
    this.buyer = buyer;
  }

  public setSeller(seller: Entity_Seller) {
    this.seller = seller;
  }

  public setInvoiceGeneralData(invoiceGeneralData: InvoiceGeneralData) {
    this.invoiceGeneralData = invoiceGeneralData;
  }

  public setInvoiceTaxData(invoiceTaxData: InvoiceTaxData) {
    this.invoiceTaxData = invoiceTaxData;
  }

  public setInvoiceMonetaryData(invoiceMonetaryData: InvoiceMonetaryData) {
    this.invoiceMonetaryData = invoiceMonetaryData;
  }

  public setInvoiceLines(invoiceLines: InvoiceLine[]) {
    this.invoiceLines = invoiceLines;
  }

  public setInvoicePaymentMeans(invoicePaymentMeans: InvoicePaymentMeans) {
    this.invoicePaymentMeans = invoicePaymentMeans;
  }

  private addGeneralDataToXML = (xml: XMLBuilder, generalData: InvoiceGeneralData, params: { usesConversion: boolean }) => {
    const invoiceId = `${generalData.invoiceSeries}${generalData.invoiceNumber}`;
    xml.ele("cbc:ID").txt(invoiceId).up();

    xml.ele("cbc:IssueDate").txt(formatDate(generalData.invoiceIssueDate)).up();
    xml.ele("cbc:DueDate").txt(formatDate(generalData.invoiceDueDate)).up();
    xml.ele("cbc:InvoiceTypeCode").txt(generalData.invoiceTypeCode).up();

    if (!!generalData.additionalNote) {
      xml.ele("cbc:Note").txt(generalData.additionalNote).up();
    }

    if (!!generalData?.taxData?.taxDueCode) {
      xml.ele("cac:InvoicePeriod").ele("cbc:DescriptionCode").txt(generalData.taxData.taxDueCode).up().up();
    }

    if (!!generalData?.taxData?.taxDueDate) {
      xml.ele("cbc:TaxPointDate").txt(formatDate(generalData.taxData.taxDueDate)).up();
    }

    xml.ele("cbc:DocumentCurrencyCode").txt(generalData.currencyCode).up();

    if (params.usesConversion) {
      xml.ele("cbc:TaxCurrencyCode").txt("RON").up();
    }
  }

  private addEntityToXML = (xml: XMLBuilder, { showLegalForm, entity }: {
    showLegalForm: true;
    entity: Entity_Seller;
  } | {
    showLegalForm: false;
    entity: Entity_Buyer;
  }, params: { showVATData: boolean }) => {
    const party = xml.ele("cac:Party");

    const address = party.ele("cac:PostalAddress");
    address.ele("cbc:StreetName").txt(entity.address.streetName).up();
    address.ele("cbc:CityName").txt(entity.address.cityName).up();
    address.ele("cbc:CountrySubentity").txt(entity.address.countrySubentityCode).up();
    address.ele("cac:Country").ele("cbc:IdentificationCode").txt(entity.address.countryCode).up().up();

    const taxScheme = party.ele("cac:PartyTaxScheme");

    taxScheme.ele("cbc:CompanyID").txt(entity.taxRegistrationCode ?? entity.registrationCode).up();

    if (!!entity.taxRegistrationCode && params.showVATData === true) {
      taxScheme.ele('cac:TaxScheme').ele('cbc:ID').txt('VAT').up().up();
    } else {
      taxScheme.ele('cac:TaxScheme').up();
    }

    const legalEntity = party.ele("cac:PartyLegalEntity");

    legalEntity.ele("cbc:RegistrationName").txt(entity.registrationName).up();
    legalEntity.ele("cbc:CompanyID").txt(entity.regCom).up();

    // The buyer entity shall not have additional legal form data
    showLegalForm && legalEntity.ele("cbc:CompanyLegalForm").txt(entity?.legalFormData ?? "").up();

    party.ele("cac:Contact").up();

    xml.up();
  }

  private addTaxDataToXML = (xml: XMLBuilder, data: { taxData: InvoiceTaxData, generalData: InvoiceGeneralData }, params: { usesConversion: boolean }) => {
    const taxTotal = xml.ele('cac:TaxTotal');

    taxTotal.ele('cbc:TaxAmount', { currencyID: data.generalData.currencyCode }).txt(data.taxData.taxTotal.toFixed(2)).up();

    // There can be multiple tax subtotals
    for (const subtotalElement of data.taxData.taxSubtotalData) {
      const subtotal = taxTotal.ele('cac:TaxSubtotal');

      subtotal.ele('cbc:TaxableAmount', { currencyID: data.generalData.currencyCode }).txt(subtotalElement.taxableAmount.toFixed(2)).up();
      subtotal.ele('cbc:TaxAmount', { currencyID: data.generalData.currencyCode }).txt(subtotalElement.taxAmount.toFixed(2)).up();

      const taxCategory = subtotal.ele('cac:TaxCategory');
      taxCategory.ele('cbc:ID').txt(subtotalElement.categoryId).up();

      !!subtotalElement.taxPercentage && taxCategory.ele('cbc:Percent').txt(subtotalElement.taxPercentage.toFixed(0)).up();

      !!subtotalElement.taxExemptionReasonCode && taxCategory.ele('cbc:TaxExemptionReasonCode').txt(subtotalElement.taxExemptionReasonCode).up();
      !!subtotalElement.taxExemptionReason && taxCategory.ele('cbc:TaxExemptionReason').txt(subtotalElement.taxExemptionReason).up();

      if (!subtotalElement.taxExemptionReasonCode && !subtotalElement.taxPercentage) {
        throw new Error("Missing tax percentage and tax exemption reason code");
      }

      taxCategory.ele('cac:TaxScheme').ele('cbc:ID').txt(subtotalElement.taxSchemeId).up().up();

      subtotal.up();
    }

    taxTotal.up();

    // If the invoices uses currency conversion, then there shall be another cac:TaxTotal element only with a cbc:TaxAmount child
    // in the RON currency with a converted value at the BNR conversion rate.
    if (params.usesConversion) {
      const convertedTaxAmount = convertCurrency(data.taxData.taxTotal, data.generalData.currencyCode, "RON", this.conversionRates);
      xml.ele('cac:TaxTotal').ele('cbc:TaxAmount', { currencyID: "RON" }).txt(convertedTaxAmount.toFixed(2)).up().up();
    }
  }

  private addMonetaryDataToXML = (xml: XMLBuilder, data: { monetaryData: InvoiceMonetaryData, generalData: InvoiceGeneralData }) => {
    const monetaryTotal = xml.ele('cac:LegalMonetaryTotal');

    monetaryTotal.ele('cbc:LineExtensionAmount', { currencyID: data.generalData.currencyCode }).txt(data.monetaryData.lineExtensionAmount.toFixed(2)).up();
    monetaryTotal.ele('cbc:TaxExclusiveAmount', { currencyID: data.generalData.currencyCode }).txt(data.monetaryData.taxExclusiveAmount.toFixed(2)).up();
    monetaryTotal.ele('cbc:TaxInclusiveAmount', { currencyID: data.generalData.currencyCode }).txt(data.monetaryData.taxInclusiveAmount.toFixed(2)).up();
    monetaryTotal.ele('cbc:PayableAmount', { currencyID: data.generalData.currencyCode }).txt(data.monetaryData.payableAmount.toFixed(2)).up();

    monetaryTotal.up();
  }

  private addInvoiceLinesToXML = (xml: XMLBuilder, data: { invoiceLines: InvoiceLine[], generalData: InvoiceGeneralData }) => {
    for (const invoiceLine of data.invoiceLines) {
      const line = xml.ele('cac:InvoiceLine');

      line.ele('cbc:ID').txt(invoiceLine.id).up();
      line.ele('cbc:InvoicedQuantity', { unitCode: invoiceLine.unitCode }).txt(invoiceLine.invoicedQuantity.toFixed(2)).up();
      line.ele('cbc:LineExtensionAmount', { currencyID: data.generalData.currencyCode }).txt(invoiceLine.lineTotal.toFixed(2)).up();

      const item = line.ele('cac:Item');

      item.ele('cbc:Name').txt(invoiceLine.item.name).up();
      if (!!invoiceLine.item.sellerIdentificationID) {
        item.ele('cac:SellersItemIdentification').ele('cbc:ID').txt(invoiceLine.item.sellerIdentificationID).up().up();
      }


      const tax = item.ele('cac:ClassifiedTaxCategory');
      tax.ele('cbc:ID').txt(invoiceLine.item.tax.id).up();

      !!invoiceLine.item.tax.taxPercentage && tax.ele('cbc:Percent').txt(invoiceLine.item.tax.taxPercentage.toFixed(2)).up();

      tax.ele('cac:TaxScheme').ele('cbc:ID').txt(invoiceLine.item.tax.taxId).up().up();

      tax.up();

      item.up();

      const price = line.ele('cac:Price');

      price.ele('cbc:PriceAmount', { currencyID: data.generalData.currencyCode }).txt(invoiceLine.price.priceAmount.toFixed(2)).up();
      price.ele('cbc:BaseQuantity', { unitCode: invoiceLine.unitCode }).txt(invoiceLine.price.baseQuantity.toFixed(0)).up();

      price.up();
      line.up();
    }
  }

  private addPaymentMeansToXML = (xml: XMLBuilder, data: { paymentMeans: InvoicePaymentMeans }) => {
    const paymentMeans = xml.ele('cac:PaymentMeans');

    // General data
    paymentMeans.ele('cbc:PaymentMeansCode', data.paymentMeans?.paymentMeanDescription ? { name: data.paymentMeans.paymentMeanDescription } : {}).txt(data.paymentMeans.paymentMeansCode).up();
    data.paymentMeans.paymentMeanNoticeID && paymentMeans.ele('cbc:PaymentID').txt(data.paymentMeans.paymentMeanNoticeID).up();

    // Handle card payment
    if (!!data.paymentMeans.creditOrDebitCardPaymentData) {
      const cardPayment = paymentMeans.ele('cac:CardAccount');

      cardPayment.ele('cbc:PrimaryAccountNumberID').txt(data.paymentMeans.creditOrDebitCardPaymentData.mainAccountNumber).up();
      cardPayment.ele('cbc:NetworkID').txt(data.paymentMeans.creditOrDebitCardPaymentData.cardType).up();
      cardPayment.ele('cbc:HolderName').txt(data.paymentMeans.creditOrDebitCardPaymentData.cardOwnerName).up();

      cardPayment.up();
    }

    // Handle bank transfer payment
    if (!!data.paymentMeans.transferData) {
      const bankPayment = paymentMeans.ele('cac:PayeeFinancialAccount');

      bankPayment.ele('cbc:ID').txt(data.paymentMeans.transferData.payeeFinancialAccountID).up();
      bankPayment.ele('cbc:Name').txt(data.paymentMeans.transferData.payeeFinancialAccountName).up();
      bankPayment.ele('cac:FinancialInstitutionBranch').ele('cbc:ID').txt(data.paymentMeans.transferData.payeeFinancialAccountBankName).up().up();

      bankPayment.up();
    }

    // Handle direct debit payment
    if (!!data.paymentMeans.directDebitPaymentData) {
      const directDebitPayment = paymentMeans.ele('cac:PaymentMandate');

      directDebitPayment.ele('cbc:ID').txt(data.paymentMeans.directDebitPaymentData.mandateID).up();
      directDebitPayment.ele('cac:PayerFinancialAccount').ele('cbc:ID').txt(data.paymentMeans.directDebitPaymentData.debitedAccountID).up().up();

      directDebitPayment.up();
    }

    paymentMeans.up();
  }

  public generateInvoice() {
    // Check if all required data is present
    if (!this.buyer || !this.seller || !this.invoiceGeneralData || !this.invoiceTaxData || !this.invoiceMonetaryData || !this.invoiceLines?.length) {
      throw new Error("Missing required data");
    }

    // Create basic XML with required metadata 
    const root = create({ version: '1.0', encoding: "UTF-8" });

    // Metadata is copy-pasted from an internal XML invoice file.
    const invoice = root.ele("Invoice", {
      "xmlns:cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
      "xmlns:udt": "urn:oasis:names:specification:ubl:schema:xsd:UnqualifiedDataTypes-2",
      "xmlns:cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
      "xmlns:ccts": "urn:un:unece:uncefact:documentation:2",
      "xmlns": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
      "xmlns:qdt": "urn:oasis:names:specification:ubl:schema:xsd:QualifiedDataTypes-2",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
    });

    invoice.ele("cbc:UBLVersionID").txt("2.1").up();
    invoice.ele("cbc:CustomizationID").txt("urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1").up();

    // Determine if the invoice requires currency conversion
    const usesConversion = this.invoiceGeneralData.currencyCode !== 'RON';

    // Add the general data to the XML
    this.addGeneralDataToXML(invoice, this.invoiceGeneralData, { usesConversion });

    // Determine if the invoice requires VAT data
    // If the seller does not have a tax registration code 
    // OR 
    // the invoice lines have *at least one* item which does not support VAT, then the whole invoice shall not present any VAT data
    // *According to the CIUS-RO standard
    const showVATData = !this.seller.taxRegistrationCode ? false : true ?? this.invoiceLines.reduce((_, curr) => curr.item.tax.taxPercentage === null ? false : true, true);

    // Add the seller and buyer entities to the XML according to the validation rules
    const supplierParty = invoice.ele("cac:AccountingSupplierParty");
    this.addEntityToXML(supplierParty, { showLegalForm: true, entity: this.seller }, { showVATData });

    const customerParty = invoice.ele("cac:AccountingCustomerParty");
    this.addEntityToXML(customerParty, { showLegalForm: false, entity: this.buyer }, { showVATData });

    if (!!this.invoicePaymentMeans) {
      // Add payment means to the XML
      this.addPaymentMeansToXML(invoice, { paymentMeans: this.invoicePaymentMeans });
    }

    // Add the tax data to the XML according to the validation rules
    this.addTaxDataToXML(invoice, { taxData: this.invoiceTaxData, generalData: this.invoiceGeneralData }, { usesConversion });

    // Add the monetary data to the XML
    this.addMonetaryDataToXML(invoice, { monetaryData: this.invoiceMonetaryData, generalData: this.invoiceGeneralData });

    // Add the invoice lines to the XML
    // *Not all features are supported right now.
    this.addInvoiceLinesToXML(invoice, { invoiceLines: this.invoiceLines, generalData: this.invoiceGeneralData });

    // Generate and return the XML file.
    const xml = root.end({ prettyPrint: true });
    return xml;
  }
}

export const getAllInvoiceTypeCodes = () => {
  return InvoiceTypeCodes;
}

export const getInvoiceTypeCodeDescription = (code: InvoiceTypeCode) => {
  if (!InvoiceTypeCodes.includes(code)) {
    return null
  }

  return InvoiceTypeCodesDescriptions[code];
}

export const getAllTaxDueCodes = () => {
  return TaxDueCodes;
}

export const getTaxDueCodeDescription = (code: TaxDueCode) => {
  if (!TaxDueCodes.includes(code)) {
    return null
  }

  return TaxDueCodesDescriptions[code];
}

export type { Entity_Seller, Entity_Buyer, InvoiceGeneralData, ConversionRates, InvoiceLine, InvoiceMonetaryData, InvoicePaymentMeans, InvoiceTaxData, InvoiceTypeCode, TaxDueCode } from "./types";
