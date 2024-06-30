export const InvoiceTypeCodes = ["380", "384", "389", "751"] as const;
export const InvoiceTypeCodesDescriptions = {
  "380": "Factura",
  "384": "Factura corectata",
  "389": "Autofactura",
  "751": "Factura - informatii in scopuri contabile"
} as const

export const TaxCategoryCodes = ['S', 'Z', 'E', 'AE', 'K', 'G', 'O', 'L', 'M'] as const

export const TaxDueCodes = ['3', '35', '432'] as const;
export const TaxDueCodesDescriptions = {
  '3': 'Data emiterii facturii',
  '35': 'Data reală a livrării',
  '432': 'Suma plătită în acea zi'
} as const;
