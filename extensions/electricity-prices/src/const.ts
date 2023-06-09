export interface ConfigItem {
  currency: string;
  smallestAmountPronunciation: string;
  API_URL: string;
  price_with_vat: string;
  price_with_vat_string: string;
  per_kWh: string;
}

export const CONFIG = {
  dk: {
    currency: "DKK",
    smallestAmountPronunciation: "øre",
    API_URL: "https://www.elprisenligenu.dk/api/v1/prices/",
    price_with_vat: "DKK_per_kWh_with_vat",
    price_with_vat_string: "DKK_per_kWh_with_vat_string",
    per_kWh: "DKK_per_kWh",
  },
  no: {
    currency: "NOK",
    smallestAmountPronunciation: "øre",
    API_URL: "https://www.hvakosterstrommen.no/api/v1/prices/",
    price_with_vat: "NOK_per_kWh_with_vat",
    price_with_vat_string: "NOK_per_kWh_with_vat_string",
    per_kWh: "NOK_per_kWh",
  },
  se: {
    currency: "SEK",
    smallestAmountPronunciation: "øre",
    API_URL: "https://www.elprisetjustnu.se/api/v1/prices/",
    price_with_vat: "SEK_per_kWh_with_vat",
    price_with_vat_string: "SEK_per_kWh_with_vat_string",
    per_kWh: "SEK_per_kWh",
  },
};
