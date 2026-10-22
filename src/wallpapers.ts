/** A Bing wallpaper entry */
export interface Wallpaper {
  /** Image date in YYYYMMDD format */
  enddate: string;
  /** Image copyright/caption */
  copyright: string;
  /** Image URL (without size parameters) */
  url: string;
}

/** Wallpaper source site */
export type Source = "cn" | "www";

/** Maximum number of wallpapers shown on the homepage */
export const RECENT_LIMIT = 365;

/** Extract the Bing image id from a wallpaper URL */
export function imageId(url: string): string | undefined {
  const id = parseUrl(url)?.searchParams.get("id");
  return id ? id : undefined;
}

/** Infer the source site from a wallpaper URL */
export function sourceOf(url: string): Source | undefined {
  const host = parseUrl(url)?.hostname;
  if (host === "cn.bing.com") return "cn";
  if (host === "www.bing.com") return "www";
  return undefined;
}

/** Generate a thumbnail URL with size parameters */
export function thumbnailUrl(url: string, width: number): string {
  const parsed = parseUrl(url);
  if (parsed === undefined) return url;
  parsed.searchParams.set("rf", "LaDigue_UHD.jpg");
  parsed.searchParams.set("w", String(width));
  parsed.searchParams.set("c", "1");
  return parsed.toString();
}

/** Filter out invalid data missing URL or date */
export function isValidWallpaper(item: Wallpaper): boolean {
  return Boolean(item.url) && /^\d{8}$/.test(item.enddate);
}

/** Sort by date descending (newest first) */
export function sortByDateDesc(items: readonly Wallpaper[]): Wallpaper[] {
  return [...items].sort((a, b) => b.enddate.localeCompare(a.enddate));
}

/** Sort by date ascending (for data file writes to minimize diff) */
export function sortByDateAsc(items: readonly Wallpaper[]): Wallpaper[] {
  return [...items].sort((a, b) => a.enddate.localeCompare(b.enddate));
}

/** Deduplicate by image id, keeping the first occurrence */
export function dedupeById(items: readonly Wallpaper[]): Wallpaper[] {
  const seen = new Set<string>();
  const result: Wallpaper[] = [];
  for (const item of items) {
    const id = imageId(item.url) ?? item.url;
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(item);
  }
  return result;
}

/** Clean: filter invalid items, deduplicate, sort ascending (for writing back to data file) */
export function clean(items: readonly Wallpaper[]): Wallpaper[] {
  return sortByDateAsc(dedupeById(items.filter(isValidWallpaper)));
}

/** Clean: filter invalid items, deduplicate, sort descending (for display) */
export function normalize(items: readonly Wallpaper[]): Wallpaper[] {
  return sortByDateDesc(clean(items));
}

/**
 * Get the latest `limit` wallpapers grouped by source.
 * Each group is also ordered newest first.
 */
export function recentWallpapers(
  items: readonly Wallpaper[],
  limit = RECENT_LIMIT,
): Record<Source, Wallpaper[]> {
  const groups: Record<Source, Wallpaper[]> = { cn: [], www: [] };
  for (const item of normalize(items).slice(0, limit)) {
    const source = sourceOf(item.url);
    if (source === undefined) continue;
    groups[source].push(item);
  }
  return groups;
}

function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}
