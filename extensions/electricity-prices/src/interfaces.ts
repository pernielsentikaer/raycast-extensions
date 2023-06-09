export interface Entry {
  [key: string]: number | string | undefined;

  DKK_per_kWh: number;
  NOK_per_kWh?: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_start_time: string;
  time_end: string;
  time_end_time: string;
  DKK_per_kWh_with_vat: number;
  EUR_per_kWh_with_vat: number;

  DKK_per_kWh_with_vat_string: string;
  EUR_per_kWh_with_vat_string: string;

  kWh_diff: number;
  kWh_diff_way: string;
  kwh_diff_below_average: number;
  kWh_diff_percent_string: string;
}

export interface Entries {
  average: number;
  entries: Entry[];
}
