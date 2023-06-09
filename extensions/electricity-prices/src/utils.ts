import { ConfigItem } from "./const";
import { Entry } from "./interfaces";

export function calculateAverage(data: Entry[], CONFIG: ConfigItem): number {
  return data.reduce((acc, entry) => acc + Number(entry[CONFIG.per_kWh]), 0) / data.length;
}

export function dateString(date: Date) {
  return date.getDate().toString().padStart(2, "0");
}

export function monthString(date: Date) {
  return (date.getMonth() + 1).toString().padStart(2, "0");
}

export function yearString(date: Date) {
  return date.getFullYear();
}

export function currentHourString(date: Date) {
  return date.getHours().toString();
}
