import { ConversionRates } from "src/types";

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, customConversionRates?: ConversionRates | null) => {
  const customAmount = customConversionRates?.[`${fromCurrency}:${toCurrency}`];
  if (!!customAmount) {
    return amount * customAmount;
  }

  switch (`${fromCurrency}:${toCurrency}`) {
    case "EUR:RON":
      return amount * 4.98;

    case "RON:EUR":
      return amount * 0.20;

    default:
      throw new Error("Unsupported currency conversion");
  }
}