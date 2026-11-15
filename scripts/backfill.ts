import { clean, imageId, type Wallpaper } from "../src/wallpapers.ts";
import { readFile, writeFile } from "node:fs/promises";

const PATH = new URL("../data/wallpapers.json", import.meta.url);

/**
 * Bing's HPImageArchive.aspx only serves the most recent 8 days. When the
 * scheduled job is paused for longer than that, the gap can no longer be
 * recovered from Bing itself. This script rebuilds missing dates from a public
 * daily archive that stores one record per market (zh-CN / en-US) per day.
 *
 * It is a best-effort safety net:
 *  - Nothing is fetched when the data file has no recent holes (the common
 *    case on a healthy daily schedule), so it adds no cost to normal runs.
 *  - Archive failures are logged but never fail the job; the regular
 *    `wallpapers` step still owns the actual collection.
 *  - Existing records are never modified; only missing dates are appended.
 *
 * Optional: set ARCHIVE_DIR to a directory containing zh-CN_all.json and
 * en-US_all.json to backfill from local snapshots without network access.
 */
const ARCHIVES = [
  {
    market: "zh-CN",
    file: "zh-CN_all.json",
    url: "https://raw.githubusercontent.com/zkeq/Bing-Wallpaper-Action/main/data/zh-CN_all.json",
    base: "https://cn.bing.com",
  },
  {
    market: "en-US",
    file: "en-US_all.json",
    url: "https://raw.githubusercontent.com/zkeq/Bing-Wallpaper-Action/main/data/en-US_all.json",
    base: "https://www.bing.com",
  },
] as const;

/** Only fill holes within this many days; older gaps are left untouched. */
const LOOKBACK_DAYS = 90;
const TIMEOUT = 120_000;
const DAY_MS = 86_400_000;

interface RawImage {
  enddate?: string;
  copyright?: string;
  urlbase?: string;
}

interface Archive {
  data?: RawImage[];
}

type ArchiveEntry = (typeof ARCHIVES)[number];

function dateToNumber(date: string): number {
  return Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(4, 6)) - 1,
    Number(date.slice(6, 8)),
  );
}

function numberToDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10).replace(/-/g, "");
}

/** Load one market archive as an enddate -> record map. */
async function loadArchive(
  archive: ArchiveEntry,
): Promise<Map<string, RawImage>> {
  const dir = process.env.ARCHIVE_DIR;
  let json: Archive;
  if (dir) {
    json = JSON.parse(
      await readFile(`${dir}/${archive.file}`, "utf8"),
    ) as Archive;
  } else {
    const res = await fetch(archive.url, {
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    json = (await res.json()) as Archive;
  }
  if (!Array.isArray(json.data))
    throw new Error(`[${archive.market}] response missing "data" field`);

  const byDate = new Map<string, RawImage>();
  for (const image of json.data) {
    if (typeof image.enddate === "string") byDate.set(image.enddate, image);
  }
  return byDate;
}

/** Rebuild a wallpaper record from the archive's urlbase (no size suffix). */
function toWallpaper(base: string, raw: RawImage): Wallpaper | undefined {
  const { urlbase = "", enddate = "", copyright = "" } = raw;
  if (!/^\d{8}$/.test(enddate) || !urlbase.startsWith("/th?id="))
    return undefined;
  return { enddate, copyright, url: `${base}${urlbase}_UHD.jpg` };
}

const wallpapers: Wallpaper[] = JSON.parse(await readFile(PATH, "utf8"));
const existingDates = new Set(wallpapers.map((item) => item.enddate));

const today = numberToDate(Date.now());
const cutoff = numberToDate(dateToNumber(today) - LOOKBACK_DAYS * DAY_MS);

// Step 1: find recent missing dates without touching the network.
const missing: string[] = [];
for (
  let day = dateToNumber(cutoff);
  day <= dateToNumber(today);
  day += DAY_MS
) {
  const date = numberToDate(day);
  if (!existingDates.has(date)) missing.push(date);
}

if (missing.length === 0) {
  console.log("No missing dates in the backfill window; nothing to do");
} else {
  console.log(
    `Found ${missing.length} missing dates (${missing[0]}..${missing.at(-1)}); fetching archives`,
  );

  // Step 2: best-effort archive fetch; a failure must not break the daily job.
  const settled = await Promise.allSettled(ARCHIVES.map(loadArchive));
  const archives = settled
    .map((result, index) => {
      const archive = ARCHIVES[index]!;
      if (result.status === "fulfilled")
        return { ...archive, dates: result.value };
      console.error(
        `[${archive.market}] archive unavailable: ${String(result.reason)}`,
      );
      return undefined;
    })
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  const existingIds = new Set(
    wallpapers.map((item) => imageId(item.url) ?? item.url),
  );
  let added = 0;
  for (const date of missing) {
    for (const archive of archives) {
      const raw = archive.dates.get(date);
      if (raw === undefined) continue;
      const item = toWallpaper(archive.base, raw);
      if (item === undefined) continue;
      const id = imageId(item.url) ?? item.url;
      if (existingIds.has(id)) continue;
      existingIds.add(id);
      wallpapers.push(item);
      added += 1;
    }
  }

  if (added === 0) {
    console.error("Archives have no usable records for the missing dates");
  } else {
    const result = clean(wallpapers);
    await writeFile(PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    console.log(
      `Backfilled ${added} records across ${missing.length} dates -> ${PATH.pathname}`,
    );
    console.log(`Total ${result.length} items`);
  }
}
