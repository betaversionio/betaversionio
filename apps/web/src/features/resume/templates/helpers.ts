/**
 * Escape special LaTeX characters in a string.
 */
export function escapeLatex(text: string | undefined | null): string {
  if (!text) return "";
  return (
    text
      // Strip non-ASCII characters that pdflatex can't handle
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/([&%$#_{}])/g, "\\$1")
      .replace(/~/g, "\\textasciitilde{}")
      .replace(/\^/g, "\\textasciicircum{}")
  );
}

/**
 * Format an ISO date string to "Mon YYYY" (e.g., "Jan 2024").
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "Present";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format a date range like "Jan 2022 -- Present".
 */
export function formatDateRange(
  startDate: string,
  endDate?: string | null,
  current?: boolean,
): string {
  const start = formatDate(startDate);
  const end = current ? "Present" : formatDate(endDate);
  return `${start} -- ${end}`;
}

/**
 * Group skills by category.
 */
export function groupByCategory(
  skills: Array<{ name: string; category?: string }>,
): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const skill of skills) {
    const cat = skill.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(skill.name);
  }
  return groups;
}
