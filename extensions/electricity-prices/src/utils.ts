import { Entry } from "./interfaces";

export function calculateAverage(data: Entry[]): number {
  return data.reduce((acc, entry) => acc + entry.DKK_per_kWh, 0) / data.length;
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
