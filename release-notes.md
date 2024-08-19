# Versiunea 1.0.5

Non-breaking changes:

- Modificat generarea XML a entitatilor:
  1. Campul `cbc:CompanyID` din `cac:PartyLegalEntity` are acum valoarea numarului de inregistrare din reg. com. in loc de CIF.
  2. Campul `cbc:CompanyLegalForm` din `cac:PartyLegalEntity` are acum valoarea `legalFormData` din `Entity_Seller`.

Breaking changes:

- Separat type-ul `Entity` in `Entity_Seller` si `Entity_Buyer` din cauza field-ului `legalFormData`.
- Adaugat field-ul `legalFormData` in clasa `Entity_Seller`.

# Versiunea 1.0.4

Non-breaking changes:

- Field-ul `invoicePaymentMeans` este optional.

# Versiunea 1.0.3

Non-breaking changes:

- Adaugat `setConversionRates` pentru a seta rate de conversie custom.
- Adaugat metadata in `package.json`.

Breaking changes:

- None.
