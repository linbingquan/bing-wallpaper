import { wallpapers } from "@scope/wallpapers";

const path = "./packages/wallpapers/wallpapers.json";

/** 壁纸图片 */
interface Wallpaper {
  /** 图片时间 */
  enddate?: string;
  /** 图片版权 */
  copyright?: string;
  /** 图片地址 */
  url?: string;
}

async function fetchWallpapers(BING_URL: string, mkt = "zh-CN") {
  mkt = BING_URL.includes("cn") ? `&mkt=${mkt}` : "";
  /** bing 壁纸地址 API */
  const BING_API =
    `${BING_URL}/HPImageArchive.aspx?format=js&idx=0&n=8&uhd=1&uhdwidth=3840&uhdheight=2160` +
    mkt;

  const images = await fetch(BING_API)
    .then((res) => res.json())
    .then((json: { images: Wallpaper[] }) => json.images);

  images.forEach((image) => {
    const {
      url = "", // 图片地址
      enddate = "", // 结束图片时间
      copyright = "", // 图片版权
    } = image;

    // 查找最新的壁纸
    const wallpaper = wallpapers.find((item) =>
      new URL(item.url).searchParams.get("id") ===
        new URL(`${BING_URL}${url}`).searchParams.get("id")
    );
    // 没找到今天的壁纸
    if (wallpaper === undefined) {
      // 追加今天的壁纸
      const originUrl = url.slice(0, url.indexOf("&"));

      const wallpaper = {
        enddate: enddate,
        copyright,
        url: `${BING_URL}${originUrl}`,
      };
      console.log(wallpaper);
      wallpapers.push(wallpaper);
    }
  });

  // 格式化 json 并写入文件
  const array = wallpapers.sort((a, b) =>
    Number(a.enddate) - Number(b.enddate)
  );
  const string = JSON.stringify(array, null, 2);
  Deno.writeTextFileSync(path, string);
  console.log(`${BING_URL} -> ${path} 更新成功`);
}

await fetchWallpapers("https://cn.bing.com");
await fetchWallpapers("https://www.bing.com");
