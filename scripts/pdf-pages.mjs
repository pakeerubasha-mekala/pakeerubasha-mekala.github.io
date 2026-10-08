// Counts the pages of a PDF written by Chromium (page objects are /Type /Page, as opposed to /Type /Pages).
import { readFileSync } from 'node:fs';

export function countPages(file) {
  const text = readFileSync(file).toString('latin1');
  return (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
}
