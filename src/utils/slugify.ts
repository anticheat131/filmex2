// utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // replace non-alphanumeric with hyphen
    .replace(/(^-|-$)/g, '');     // remove leading/trailing hyphen
}
