/** Rough markdown-to-text for search indexing (not for display). */
export function plainText(markdown: string | undefined, maxChars = 6000): string {
  return (markdown ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxChars);
}
