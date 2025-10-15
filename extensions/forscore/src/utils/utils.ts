import { getApplications, showToast, Toast, open } from "@raycast/api";
import { existsSync, readFileSync } from "fs";
import { FORSCORE_BUNDLE_ID, FORSCORE_WEBSITE } from "../constants/constants";
import { Score } from "../types/Score";

async function isForScoreInstalled(): Promise<boolean> {
  const applications = await getApplications();
  return applications.some((app) => app.bundleId === FORSCORE_BUNDLE_ID);
}

export function validateForScoreCSV(path: string): string | null {
  if (!path) {
    return "Please select a file";
  }

  if (!existsSync(path)) {
    return "File does not exist";
  }

  if (!path.endsWith(".csv")) {
    return "File must be a CSV file";
  }

  // Try to read and validate CSV structure
  try {
    const content = readFileSync(path, "utf-8");
    const firstLine = content.split("\n")[0];
    if (!firstLine.includes("Arkivnavn") && !firstLine.includes("Titel")) {
      return "Invalid forScore CSV format";
    }
  } catch (err) {
    return `Cannot read file: ${err}`;
  }

  return null; // Valid file
}

export async function checkForScoreInstallation(): Promise<boolean> {
  const isInstalled = await isForScoreInstalled();

  if (!isInstalled) {
    await showToast({
      style: Toast.Style.Failure,
      title: "forScore is not installed",
      message: `Install it from: ${FORSCORE_WEBSITE}`,
      primaryAction: {
        title: `Go to ${FORSCORE_WEBSITE}`,
        onAction: (toast) => {
          open(FORSCORE_WEBSITE);
          toast.hide();
        },
      },
    });
  }

  return isInstalled;
}
export function parseCSV(csvContent: string): Score[] {
  const lines = csvContent.split("\n");
  if (lines.length < 2) return [];

  const scores: Score[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",");
    if (values.length < 2) continue;

    const score: Score = {
      filename: values[0]?.trim() || "",
      title: values[1]?.trim() || values[0]?.replace(".pdf", "").trim() || "",
      startPage: values[2]?.trim(),
      endPage: values[3]?.trim(),
      composers: values[4]?.trim(),
      genres: values[5]?.trim(),
      tags: values[6]?.trim(),
      labels: values[7]?.trim(),
      id: values[8]?.trim(),
      rating: values[9]?.trim(),
      difficulty: values[10]?.trim(),
      minutes: values[11]?.trim(),
      seconds: values[12]?.trim(),
      keysf: values[13]?.trim(),
      keymi: values[14]?.trim(),
    };

    scores.push(score);
  }

  return scores;
}

export function openScore(score: Score) {
  // Use filename with .pdf extension for path parameter
  const encodedPath = encodeURIComponent(score.filename);
  open(`forscore://open?path=${encodedPath}`);
}
