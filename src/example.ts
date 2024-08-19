import { Invoice } from "./index";

import fs from 'fs';
import path from 'path';

const main = () => {
  // The following example *will* produce an error if validated.
  // There needs to be valid registered Seller and Buyer entities in order for this document to pass any validation programs.

  const invoice = new Invoice();

  invoice.setInvoiceGeneralData({
    invoiceNumber: "1",
    invoiceSeries: "test",
    invoiceIssueDate: new Date(),
    invoiceDueDate: new Date(),
    currencyCode: "EUR",
    invoiceTypeCode: "380",
    taxData: {
      taxDueCode: null,
      taxDueDate: new Date()
    },
  })

  invoice.setSeller({
    registrationName: "Seller S.R.L.",
    registrationCode: 'RO00000000',
    address: {
      streetName: "Adresa",
      cityName: "Suceava",
      countryCode: "RO",
      countrySubentityCode: "RO-SV"
    },
    regCom: "J00/000/0000",
    taxRegistrationCode: null,
    legalFormData: "Capital social: 200 LEI" // Required
  })

  invoice.setBuyer({
    registrationName: "Buyer S.A.",
    registrationCode: 'RO00000001',
    address: {
      streetName: "Adresa",
      cityName: "Suceava",
      countryCode: "RO",
      countrySubentityCode: "RO-SV"
    },
    regCom: "J00/001/0000",
    taxRegistrationCode: 'RO00000001',
  })

  // Optional
  invoice.setInvoicePaymentMeans({
    paymentMeansCode: "ZZZ",
    paymentMeanDescription: "Alta metoda",
    paymentMeanNoticeID: "Identificator Aviz."
  })

  invoice.setInvoiceTaxData({
    taxTotal: 180.50,
    taxSubtotalData: [
      {
        taxableAmount: 950,
        taxAmount: 180.50,
        categoryId: "S",
        taxSchemeId: "VAT",
        taxPercentage: 19,
        taxExemptionReasonCode: null,
        taxExemptionReason: null
      }
    ]
  })

  invoice.setInvoiceMonetaryData({
    lineExtensionAmount: 950,
    taxExclusiveAmount: 950,
    taxInclusiveAmount: 1130.50,
    payableAmount: 1130.50,
  });

  invoice.setInvoiceLines([
    {
      id: "1",
      invoicedQuantity: 10,
      unitCode: "H87",
      lineTotal: 420,
      item: {
        name: "Produs 1",
        tax: {
          id: "S",
          taxPercentage: 19,
          taxId: "VAT"
        }
      },
      price: {
        priceAmount: 42,
        baseQuantity: 1
      }
    },
    {
      id: "2",
      invoicedQuantity: 10,
      lineTotal: 530,
      unitCode: "H87",
      item: {
        name: "Produs 2",
        tax: {
          taxPercentage: 19,
          taxId: "VAT",
          id: "S"
        },
      },
      price: {
        priceAmount: 53,
        baseQuantity: 1
      }
    }
  ]);

  const xml = invoice.generateInvoice();

  fs.writeFileSync(path.join(__dirname, '../test_example.xml'), xml, "utf-8");
}

main();
