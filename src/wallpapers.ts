/** 壁纸 */
export interface Wallpaper {
  /** 图片时间，格式 YYYYMMDD */
  enddate: string;
  /** 图片版权 */
  copyright: string;
  /** 图片地址（不含尺寸参数） */
  url: string;
}

/** 壁纸来源站点 */
export type Source = "cn" | "www";

/** 首页展示的壁纸数量上限 */
export const RECENT_LIMIT = 365;

/** 从壁纸地址中取出 bing 的图片 id */
export function imageId(url: string): string | undefined {
  const id = parseUrl(url)?.searchParams.get("id");
  return id ? id : undefined;
}

/** 从壁纸地址推断来源站点 */
export function sourceOf(url: string): Source | undefined {
  const host = parseUrl(url)?.hostname;
  if (host === "cn.bing.com") return "cn";
  if (host === "www.bing.com") return "www";
  return undefined;
}

/** 生成缩略图地址 */
export function thumbnailUrl(url: string, width: number): string {
  const parsed = parseUrl(url);
  if (parsed === undefined) return url;
  parsed.searchParams.set("rf", "LaDigue_UHD.jpg");
  parsed.searchParams.set("w", String(width));
  parsed.searchParams.set("c", "1");
  return parsed.toString();
}

/** 过滤掉缺少地址或日期的脏数据 */
export function isValidWallpaper(item: Wallpaper): boolean {
  return Boolean(item.url) && /^\d{8}$/.test(item.enddate);
}

/** 按日期倒序（最新在前） */
export function sortByDateDesc(items: readonly Wallpaper[]): Wallpaper[] {
  return [...items].sort((a, b) => b.enddate.localeCompare(a.enddate));
}

/** 按日期正序（数据文件按此顺序追加写入，diff 更小） */
export function sortByDateAsc(items: readonly Wallpaper[]): Wallpaper[] {
  return [...items].sort((a, b) => a.enddate.localeCompare(b.enddate));
}

/** 按图片 id 去重，保留先出现的记录 */
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

/** 清洗：去脏数据、去重、按日期正序（用于写回数据文件） */
export function clean(items: readonly Wallpaper[]): Wallpaper[] {
  return sortByDateAsc(dedupeById(items.filter(isValidWallpaper)));
}

/** 清洗：去脏数据、去重、按日期倒序（用于展示） */
export function normalize(items: readonly Wallpaper[]): Wallpaper[] {
  return sortByDateDesc(clean(items));
}

/**
 * 取最近 `limit` 条壁纸并按来源分组。
 * 两个分组内部同样是最新在前。
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
