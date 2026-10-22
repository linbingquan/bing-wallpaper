import { clean, dedupeById, imageId, type Wallpaper } from "@scope/wallpapers";
import { readFile, writeFile } from "node:fs/promises";

const PATH = new URL("../packages/wallpapers/wallpapers.json", import.meta.url);

/** Bing 壁纸接口返回的原始数据 */
interface RawImage {
  enddate?: string;
  copyright?: string;
  url?: string;
}

/** 来源站点，cn 使用中文市场 */
const SOURCES = [
  { base: "https://cn.bing.com", mkt: "zh-CN" },
  { base: "https://www.bing.com", mkt: undefined },
] as const;

const TIMEOUT = 15_000;
const RETRY = 2;

/** 请求 bing 壁纸列表 */
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
      if (!Array.isArray(json.images)) throw new Error("响应缺少 images 字段");
      return json.images;
    } catch (error) {
      if (attempt >= RETRY) {
        throw new Error(`${url} 请求失败: ${String(error)}`, { cause: error });
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/** 原始数据转成壁纸记录 */
function toWallpaper(base: string, raw: RawImage): Wallpaper | undefined {
  const { url = "", enddate = "", copyright = "" } = raw;
  if (!url) return undefined;
  // 去掉尺寸参数，只保留 id，缩略图在展示时再拼
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
  console.error("所有来源均失败或返回空数组，跳过写盘");
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

      const known = new Set(dedupeById(wallpapers).map((item) => imageId(item.url)));
      const added = latest.filter((item) => {
        const id = imageId(item.url);
        return id !== undefined && !known.has(id);
      });

      wallpapers.push(...added);
      console.log(`[${base}] 拉取 ${latest.length} 条，新增 ${added.length} 条`);
    } else {
      console.error(`[${base}] ${String(res.reason)}`);
    }
  }

  const result = clean(wallpapers);
  await writeFile(PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(`共 ${result.length} 条 -> ${PATH.pathname}`);

  const someFailed = results.some((r) => r.status === "rejected");
  if (someFailed) process.exitCode = 1;
}
