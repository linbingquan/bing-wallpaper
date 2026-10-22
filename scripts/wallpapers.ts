import {
  clean,
  dedupeById,
  imageId,
  type Wallpaper,
} from "../src/wallpapers.ts";
import { readFile, writeFile } from "node:fs/promises";

const PATH = new URL("../data/wallpapers.json", import.meta.url);

/** Raw data returned by the Bing wallpaper API */
interface RawImage {
  enddate?: string;
  copyright?: string;
  url?: string;
}

/** Source sites; cn uses the Chinese market */
const SOURCES = [
  { base: "https://cn.bing.com", mkt: "zh-CN" },
  { base: "https://www.bing.com", mkt: undefined },
] as const;

const TIMEOUT = 15_000;
const RETRY = 2;

/** Fetch the Bing wallpaper list */
async function fetchImages(
  base: string,
  mkt: string | undefined,
): Promise<RawImage[]> {
  const url = new URL("/HPImageArchive.aspx", base);
  url.searchParams.set("format", "js");
  url.searchParams.set("idx", "0");
  url.searchParams.set("n", "8");
  url.searchParams.set("uhd", "1");
  url.searchParams.set("uhdwidth", "3840");
  url.searchParams.set("uhdheight", "2160");
  if (mkt !== undefined) url.searchParams.set("mkt", mkt);

  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: { images?: RawImage[] } = await res.json();
      if (!Array.isArray(json.images)) throw new Error('Response missing "images" field');
      return json.images;
    } catch (error) {
      if (attempt >= RETRY) {
        throw new Error(`${url} request failed: ${String(error)}`, { cause: error });
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/** Convert raw data into a wallpaper record */
function toWallpaper(base: string, raw: RawImage): Wallpaper | undefined {
  const { url = "", enddate = "", copyright = "" } = raw;
  if (!url) return undefined;
  // Strip size params, keep only the id; thumbnails are constructed at display time
  const originUrl = url.split("&")[0] as string;
  return { enddate, copyright, url: `${base}${originUrl}` };
}

const wallpapers: Wallpaper[] = JSON.parse(await readFile(PATH, "utf8"));

const results = await Promise.allSettled(
  SOURCES.map(({ base, mkt }) => fetchImages(base, mkt)),
);

const allFailedOrEmpty = results.every(
  (r) => r.status === "rejected" || r.value.length === 0,
);

if (allFailedOrEmpty) {
  console.error("All sources failed or returned empty; skipping write");
  process.exitCode = 1;
} else {
  for (let i = 0; i < results.length; i++) {
    const { base } = SOURCES[i]!;
    const res = results[i]!;
    if (res.status === "fulfilled") {
      const images: RawImage[] = res.value;
      const latest = images
        .map((image: RawImage) => toWallpaper(base, image))
        .filter((item): item is Wallpaper => item !== undefined);

      const known = new Set(
        dedupeById(wallpapers).map((item) => imageId(item.url)),
      );
      const added = latest.filter((item) => {
        const id = imageId(item.url);
        return id !== undefined && !known.has(id);
      });

      wallpapers.push(...added);
      console.log(
        `[${base}] fetched ${latest.length}, added ${added.length} new`,
      );
    } else {
      console.error(`[${base}] ${String(res.reason)}`);
    }
  }

  const result = clean(wallpapers);
  await writeFile(PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(`Total ${result.length} items -> ${PATH.pathname}`);

  const someFailed = results.some((r) => r.status === "rejected");
  if (someFailed) process.exitCode = 1;
}
