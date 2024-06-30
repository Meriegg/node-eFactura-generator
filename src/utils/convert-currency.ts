export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
  switch (`${fromCurrency}:${toCurrency}`) {
    case "EUR:RON":
      return amount * 4.98;
    default:
      throw new Error("Unsupported currency conversion");
  }
}