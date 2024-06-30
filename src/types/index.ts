import { InvoiceTypeCodes, TaxCategoryCodes, TaxDueCodes } from "../utils/codes";

export type InvoiceTypeCode = typeof InvoiceTypeCodes[number];
export type TaxCategoryCode = typeof TaxCategoryCodes[number];
export type TaxDueCode = typeof TaxDueCodes[number];

export type Entity = {
  registrationName: string;
  registrationCode: string;
  regCom: string;
  address: {
    streetName: string
    cityName: string;
    countrySubentityCode: string;
    countryCode: string;
  };
  taxRegistrationCode: string | null;
}

export type InvoiceGeneralData = {
  invoiceNumber: string;
  invoiceSeries: string;
  invoiceIssueDate: Date;
  invoiceDueDate: Date;
  invoiceTypeCode: InvoiceTypeCode;
  currencyCode: string;
  additionalNote?: string;
  taxData?: {
    taxDueCode: TaxDueCode,
    taxDueDate: null
  } | {
    taxDueCode: null,
    taxDueDate: Date
  }
}

export type InvoiceTaxData = {
  taxTotal: number;
  taxSubtotalData: {
    taxAmount: number;
    taxableAmount: number;
    categoryId: TaxCategoryCode;
    taxSchemeId: string;

    taxPercentage: number | null;

    taxExemptionReasonCode: string | null;
    taxExemptionReason: string | null;
  }[]
}

export type InvoiceMonetaryData = {
  lineExtensionAmount: number;
  taxExclusiveAmount: number;
  taxInclusiveAmount: number;
  payableAmount: number;
}

export type InvoiceLine = {
  id: string;
  invoicedQuantity: number;
  unitCode: string;
  lineTotal: number;

  item: {
    name: string;
    sellerIdentificationID?: string;
    tax: {
      id: TaxCategoryCode;
      taxPercentage: number | null;
      taxId: string;
    }
  }

  price: {
    priceAmount: number;
    baseQuantity: number;
  }
}

export type InvoicePaymentMeans = {
  paymentMeansCode: string;
  paymentMeanDescription?: string;
  paymentMeanNoticeID?: string;

  transferData?: {
    payeeFinancialAccountID: string;
    payeeFinancialAccountName: string;
    payeeFinancialAccountBankName: string;
  };

  creditOrDebitCardPaymentData?: {
    mainAccountNumber: string;
    cardType: string;
    cardOwnerName: string;
  }

  directDebitPaymentData?: {
    mandateID: string;
    bankCreditorID_BT_90?: string;
    debitedAccountID: string;
  }
}