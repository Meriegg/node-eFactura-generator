# Disclaimer Legal

Acest pachet și documentația aferentă sunt furnizate „așa cum sunt” și sunt destinate exclusiv scopurilor informative. Nu constituie consultanță legală sau fiscală și nu trebuie utilizate ca atare. Autorul nu garanteaza acuratețea sau completitudinea informațiilor furnizate și nu isi asuma responsabilitatea pentru eventualele erori sau omisiuni de orice fel.

Utilizarea acestui pachet este pe propriul risc. Autorul nu va fi responsabil pentru niciun fel de daune, inclusiv dar fără a se limita la daune directe, indirecte, accidentale, speciale sau consecvente, care pot apărea din utilizarea sau incapacitatea de a utiliza acest pachet, chiar dacă a fost informat despre posibilitatea acestor daune.

Pentru asistență legală sau fiscală, recomand să consultați un profesionist calificat.

# node-e-factura-generator

Generator e Factura XML in format UBL 2.1 adaptat pentru standardul CIUS-RO pentru node.js.

## Instalare

Instaleaza modulul cu comanda:

```
npm install --save node-e-factura-generator
```

## Exemplu Utilizare

Documentatie specifica mai jos.

**Nota**: Urmatorul exemplu va fi considerat invalid din cauza entitatilor (Buyer/Seller) invalide. Pentru a fi validat fara nicio eroare sunt necesare entitati valide/inregistrate.

```javascript
import { Invoice } from "node-e-factura-generator";
import fs from "fs";
import path from "path";

const main = () => {
  const invoice = new Invoice();

  invoice.setInvoiceGeneralData({
    invoiceNumber: "1",
    invoiceSeries: "test",
    invoiceIssueDate: new Date(),
    invoiceDueDate: new Date(),
    currencyCode: "RON",
    invoiceTypeCode: "380",
    taxData: {
      taxDueCode: null,
      taxDueDate: new Date(),
    },
  });

  invoice.setSeller({
    registrationName: "Seller",
    registrationCode: "RO00000000",
    address: {
      streetName: "Adresa",
      cityName: "Suceava",
      countryCode: "RO",
      countrySubentityCode: "RO-SV",
    },
    regCom: "J00/000/0000",
    taxRegistrationCode: "RO00000000",
  });

  invoice.setBuyer({
    registrationName: "Buyer",
    registrationCode: "RO00000001",
    address: {
      streetName: "Adresa",
      cityName: "Suceava",
      countryCode: "RO",
      countrySubentityCode: "RO-SV",
    },
    regCom: "J00/001/0000",
    taxRegistrationCode: "RO00000001",
  });

  // Optional
  invoice.setInvoicePaymentMeans({
    paymentMeansCode: "ZZZ",
    paymentMeanDescription: "Alta metoda",
    paymentMeanNoticeID: "Identificator Aviz.",
  });

  invoice.setInvoiceTaxData({
    taxTotal: 180.5,
    taxSubtotalData: [
      {
        taxableAmount: 950,
        taxAmount: 180.5,
        categoryId: "S",
        taxSchemeId: "VAT",
        taxPercentage: 19,
        taxExemptionReasonCode: null,
        taxExemptionReason: null,
      },
    ],
  });

  invoice.setInvoiceMonetaryData({
    lineExtensionAmount: 950,
    taxExclusiveAmount: 950,
    taxInclusiveAmount: 1130.5,
    payableAmount: 1130.5,
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
          taxId: "VAT",
        },
      },
      price: {
        priceAmount: 42,
        baseQuantity: 1,
      },
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
          id: "S",
        },
      },
      price: {
        priceAmount: 53,
        baseQuantity: 1,
      },
    },
  ]);

  const xml = invoice.generateInvoice();

  fs.writeFileSync(path.join(__dirname, "../test_example.xml"), xml, "utf-8");
};

main();
```

## Documentatie

Pentru a genera o factura exista 6 componente obligatorii:

- invoiceGeneralData - informatii generate despre factura.
- seller - informații despre vanzator.
- buyer - informații despre cumparator.
- invoiceTaxData - date TVA.
- invoiceMonetaryData - date despre totalurile facturii.
- invoiceLines - produsele facturate.

Componente optionale:

- invoicePaymentMeans - instructiuni de plata.

Informatii despre toate codurile prezente in factura sunt prezente la sectiunea "Coduri".

### `InvoiceGeneralData`

`InvoiceGeneralData` este un obiect care conține datele generale despre factura.

```typescript
export type InvoiceGeneralData = {
  invoiceNumber: string;
  invoiceSeries: string;
  invoiceIssueDate: Date;
  invoiceDueDate: Date;
  invoiceTypeCode: InvoiceTypeCode;
  currencyCode: string;
  additionalNote?: string;
  taxData?:
    | {
        taxDueCode: TaxDueCode;
        taxDueDate: null;
      }
    | {
        taxDueCode: null;
        taxDueDate: Date;
      };
  // `taxData` este un obiect optional care poate contine doar:
  // - `taxDueCode` *sau* `taxDueDate`
};
```

| Field            |        Descriere        | Tip             |
| ---------------- | :---------------------: | --------------- |
| invoiceNumber    |      Nr. facturii       | string          |
| invoiceSeries    |     seria facturii      | string          |
| invoiceIssueDate | data emiterii facturii  | Date            |
| invoiceDueDate   | data scadentei facturii | Date            |
| invoiceTypeCode  | cod tipului de factura  | InvoiceTypeCode |
| currencyCode     |       cod valuta        | string          |
| additionalNote   |     nota aditionala     | ?string         |
| taxData          |        date TVA         | object          |

Poate fi setat folosind metoda `setInvoiceGeneralData` din clasa `Invoice`.

```typescript
const invoice = new Invoice();

invoice.setInvoiceGeneralData({
  invoiceNumber: "1",
  invoiceSeries: "test",
  invoiceIssueDate: new Date(),
  invoiceDueDate: new Date(),
  currencyCode: "RON",
  invoiceTypeCode: "380",
  taxData: {
    taxDueCode: null,
    taxDueDate: new Date(),
  },
  // sau
  taxData: {
    taxDueCode: "3", // Data emiterii facturii
    taxDueDate: null,
  },
  additionalNote: "Nota aditionala", // Optional
});
```

### `Buyer` si `Seller`

`Buyer` si `Seller` sunt obiectele care conțin datele despre vanzatorul si cumparatorul facturii. Acestea folosesc aceeasi schema de date.

Schema generala:

```typescript
type Entity = {
  registrationName: string;
  registrationCode: string;
  regCom: string;
  address: {
    streetName: string;
    cityName: string;
    countrySubentityCode: string; // RO-[Cod de judet] ex: RO-SV
    countryCode: string; // RO
  };
  taxRegistrationCode: string | null;
};
```

acestea pot fi setate folosind metoda `setBuyer` sau `setSeller` din clasa `Invoice`.

```typescript
const invoice = new Invoice();

invoice.setSeller({
  registrationName: "Seller",
  registrationCode: "RO00000000",
  address: {
    streetName: "Adresa",
    cityName: "Suceava",
    countrySubentityCode: "RO-SV",
    countryCode: "RO",
  },
  taxRegistrationCode: "RO00000000",
});

// Aceeasi metoda se aplica si la `invoice.setBuyer`
```

### `InvoicePaymentMeans`

`InvoicePaymentMeans` reprezinta instructiunile de plata a facturii.

Schema generala:

```typescript
type InvoicePaymentMeans = {
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
    cardType: string; // "Visa", "MasterCard", etc.
    cardOwnerName: string;
  };

  directDebitPaymentData?: {
    mandateID: string;
    bankCreditorID_BT_90?: string;
    debitedAccountID: string;
  };
};
```

Acest obiect are 3 field-uri generale (2 dintre ele sunt optionale), apoi are date specifice fiecarui instrument de plata.

`paymentMeansCode` este codul care indentifica metoda de plata. Aceste coduri se pot gasii in documentul Excel SAF-T ANAF la [https://static.anaf.ro/static/10/Anaf/Informatii_R/SAF_T_Ro_SchemaDefinitionCodes_v4_1_6_final_1712021.xlsx](https://static.anaf.ro/static/10/Anaf/Informatii_R/SAF_T_Ro_SchemaDefinitionCodes_v4_1_6_final_1712021.xlsx) la pagina "Nom_Mecanisme_plati".

Pentru instrumentele de plata specifice, field-urile sunt usor de completat si nu necesita documentatie aditionala.

Poate fi setat folosind metoda `setInvoicePaymentMeans` din clasa `Invoice`.

```typescript
const invoice = new Invoice();

invoice.setInvoicePaymentMeans({
  paymentMeansCode: "ZZZ",
  paymentMeanDescription: "Alta metoda",
  paymentMeanNoticeID: "Identificator Aviz.",
});
```

### `InvoiceTaxData`

`InvoiceTaxData` reprezinta datele TVA a facturii.

Schema generala:

```typescript
export type InvoiceTaxData = {
  taxTotal: number;
  taxSubtotalData: {
    taxAmount: number;
    taxableAmount: number;
    categoryId: TaxCategoryCode;
    taxSchemeId: "VAT";

    taxPercentage: number | null;

    taxExemptionReasonCode: string | null;
    taxExemptionReason: string | null;
  }[];
};
```

- `taxTotal` este un field obligatoriu, daca vanzatorul este scutit de TVA, acesta va fi setat la 0.
- `taxSubtotalData` este o lista de obiecte care conțin datele despre fiecare tip de taxa supusa facturii.
- `taxSubtotalData[number].taxAmount` este suma totala taxelor supuse unei categorii de taxa.
- `taxSubtotalData[number].taxableAmount` este baza de calcul a taxelor supuse unei categorii de taxa.
- `taxSubtotalData[number].categoryId` este codul categoriei de taxa supusa (mai multe detalii in sectiunea "Coduri").
- `taxSubtotalData[number].taxSchemeId` taxa supusa, de cele mai multe ori este "VAT" (mai multe detalii in sectiunea "Coduri").
- `taxSubtotalData[number].taxPercentage` este procentul taxelor supuse.
- `taxSubtotalData[number].taxExemptionReasonCode` este codul motivului scutirii de TVA. (mai multe detalii in sectiunea "Coduri").
- `taxSubtotalData[number].taxExemptionReason` este descrierea motivului scutirii de TVA.

Se poate seta folosind metoda `setInvoiceTaxData` din clasa `Invoice`.

```typescript
const invoice = new Invoice();

invoice.setInvoiceTaxData({
  taxTotal: 180.5,
  taxSubtotalData: [
    {
      taxableAmount: 950,
      taxAmount: 180.5,
      categoryId: "S",
      taxSchemeId: "VAT",
      taxPercentage: 19,
      taxExemptionReasonCode: null,
      taxExemptionReason: null,
    },
  ],
});

// Sau

invoice.setInvoiceTaxData({
  taxTotal: 0,
  taxSubtotalData: [
    {
      taxableAmount: 950,
      taxAmount: 0,
      categoryId: "O",
      taxSchemeId: "VAT",
      taxExemptionReasonCode: "VATEX-EU-O",
      taxExemptionReason: "Nu face obiectul TVA.",
    },
  ],
});
```

### `InvoiceMonetaryData`

`InvoiceMonetaryData` reprezinta datele monetare a facturii (totalurile).

Schema generala:

```typescript
export type InvoiceMonetaryData = {
  lineExtensionAmount: number;
  taxExclusiveAmount: number;
  taxInclusiveAmount: number;
  payableAmount: number;
};
```

- `lineExtensionAmount` este suma totala liniilor facturate.
- `taxExclusiveAmount` este suma totala fara TVA.
- `taxInclusiveAmount` este suma totala cu TVA.
- `payableAmount` este totalul de plata.

Se poate seta folosind metoda `setInvoiceMonetaryData` din clasa `Invoice`.

```typescript
const invoice = new Invoice();

invoice.setInvoiceMonetaryData({
  lineExtensionAmount: 950,
  taxExclusiveAmount: 950,
  taxInclusiveAmount: 1130.5,
  payableAmount: 1130.5,
});
```

### `InvoiceLines`

`InvoiceLines` reprezinta liniile facturate.

Schema generala:

```typescript
type InvoiceLine = {
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
      taxId: "VAT";
    };
  };

  price: {
    priceAmount: number;
    baseQuantity: number;
  };
};
```

- `id` este un identificator unic pentru linia facturata (In general este folosit ca nr. crt.).
- `invoicedQuantity` este cantitatea facturata.
- `unitCode` este codul unitatii de masura. Pot fi gasite in Excelul SAF-T ANAF de mai sus. Cel mai popular este "H87" (Bucata).
- `lineTotal` este suma totala liniei facturate.

- `item` este un obiect care conține datele despre produsul facturat.

- `item.name` este numele produsului.
- `item.sellerIdentificationID` este identificatorul intern al produsului pentru vanzator.
- `item.tax` este un obiect care conține datele despre taxa produsului.
- `item.tax.id` este codul categoriei de taxa supusa (mai multe detalii in sectiunea "Coduri").
- `item.tax.taxPercentage` este procentul taxelor supuse.
- `item.tax.taxId` este codul taxei supuse (mai multe detalii in sectiunea "Coduri").

- `price` este un obiect care conține datele despre prețul produsului.
- `price.priceAmount` este pretul unitar al produsului.
- `price.baseQuantity` este cantitatea de baza a produsului (in general este 1).

# Coduri

In factura exista mai multe coduri pentru diferite informatii. Acestea sunt toate codurile prezente in factura.

## Codul `invoiceTypeCode`

codul `invoiceTypeCode` este un cod care identifica tipul de factura.

| Cod | Descriere                                 |
| --- | ----------------------------------------- |
| 380 | Factura                                   |
| 384 | Factura corectata                         |
| 389 | Autofactura                               |
| 751 | Factura - informatii in scopuri contabile |

Pentru a avea access direct se pot folosii functiile:

```typescript
import { getAllInvoiceTypeCodes } from "node-e-factura-generator";

const codes: string[] = getAllInvoiceTypeCodes();
console.log(codes); // ['380', '384', '389', '751']
```

```typescript
import { getInvoiceTypeCodeDescription } from "node-e-factura-generator";

const description: string = getInvoiceTypeCodeDescription("380");
console.log(description); // Factura
```

## Codul `taxDueCode`

codul `taxDueCode` este un cod care identifica data de scadenta TVA.

| Cod | Descriere               |
| --- | ----------------------- |
| 3   | Data emiterii facturii  |
| 35  | Data reala a livrarii   |
| 432 | Suma platita in acea zi |

Pentru a avea access direct se pot folosii functiile:

```typescript
import { getAllTaxDueCodes } from "node-e-factura-generator";

const codes: string[] = getAllTaxDueCodes();
console.log(codes); // ['3', '35', '432']
```

```typescript
import { getTaxDueCodeDescription } from "node-e-factura-generator";

const description: string = getTaxDueCodeDescription("3");
console.log(description); // Data emiterii facturii
```

## Codurile `TaxCategoryCode` sau `TaxExemptionReasonCode`

Codul `TaxCategoryCode` este folosit in mai multe field-uri sub contextul TVA din factura.

Codul `TaxExemptionReasonCode` este prezent doar in datele generale TVA a facturii.

Adesea este intalnit field-ul `taxId` sau `taxSchemeId`, acestea reprezinta tipul de taxa supusa facturii sau produsului. Din cate stiu acesta pot fi doar "VAT" (TVA), dar poate fi folosit si alt tip de taxa daca este nevoie (tipul field-urilor fiind `string`).

Exemple de folosire:

```typescript
// doar aici se gaseste `TaxExemptionReasonCode`:
invoice.setInvoiceTaxData({
  taxTotal: 180.5,
  taxSubtotalData: [
    {
      taxableAmount: 950,
      taxAmount: 180.5,
      categoryId: "S", // `TaxCategoryCode`
      taxSchemeId: "VAT",
      taxPercentage: 19,
      taxExemptionReasonCode: null, // `TaxExemptionReasonCode`
      taxExemptionReason: null, // Descrierea motivului scutirii de TVA (nu este relevant)
    },
  ],
});
```

sau direct in linia facturata:

```typescript
invoice.setInvoiceLines([
  {
    id: "1",
    invoicedQuantity: 10,
    unitCode: "H87",
    lineTotal: 420,
    item: {
      name: "Produs 1",
      tax: {
        id: "S", // `TaxCategoryCode`
        taxPercentage: 19,
        taxId: "VAT",
      },
    },
    price: {
      priceAmount: 42,
      baseQuantity: 1,
    },
  },
]);
```

Aceste coduri nu sunt specifice pentru eFactura sau acest pachet. Pentru mai multe informatii asupra acestor coduri recomand urmatoarea sursa: [https://suport.leelo.ro/portal/ro/kb/articles/explicarea-codurilor-de-scutire-de-tva-%C3%AEn-leelo](https://suport.leelo.ro/portal/ro/kb/articles/explicarea-codurilor-de-scutire-de-tva-%C3%AEn-leelo)

Linkul de mai sus **se poate schimba** si **nu este sponsorizat**.

Pentru determinarea folosirii codurilor recomand consultarea cu un contabil autorizat sau un expert in domeniu.

## Cursul valutar

Pentru facturile in valuta, acest pachet are urmatoarele rate de conversie _default_:

| Currency   | Rate |
| ---------- | ---- |
| EUR -> RON | 4.98 |
| RON -> EUR | 0.20 |

Aceste rate pot fi modificate folosind metoda `setConversionRates` din clasa `Invoice`. Aceasta metoda accepta un set de key-value pairs (unde key este in format `{FROM_CURRENCY}:${TO_CURRENCY}` si value este rata de conversie).

**Nota**:Daca ratele de conversie default nu sunt modificate explicit (ci doar ati adaugat rate de conversie noi), atunci ele vor fi aplicate in continuare daca este cazul.

Exemplu:

```typescript
import { Invoice } from "node-e-factura-generator";
import fs from "fs";
import path from "path";

const main = () => {
  const invoice = new Invoice();

  // ...

  invoice.setConversionRates({
    "EUR:RON": 4.97, // modificare
    "RON:EUR": 0.19, // modificare
    "USD:RON": 4.58, // adaugare
  });

  const xml = invoice.generateInvoice();

  fs.writeFileSync(path.join(__dirname, "../test_example.xml"), xml, "utf-8");
};
```
