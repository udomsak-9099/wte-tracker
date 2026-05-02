import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

function escape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const head = columns.map((c) => escape(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escape(row[c.key])).join(","))
    .join("\n");
  return `${head}\n${body}\n`;
}

export async function exportCsv(
  filename: string,
  csv: string
): Promise<void> {
  if (Platform.OS === "web") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  const dataUri = `data:text/csv;base64,${btoa(unescape(encodeURIComponent(csv)))}`;
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dataUri, {
      mimeType: "text/csv",
      dialogTitle: filename,
      UTI: "public.comma-separated-values-text",
    });
  }
}
