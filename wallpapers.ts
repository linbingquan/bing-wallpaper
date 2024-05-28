import wallpapers from "./fresh/routes/wallpapers.json" with { type: "json" };

/** 壁纸图片 */
interface Wallpaper {
  /** 图片时间 */
  enddate?: string;
  /** 图片版权 */
  copyright?: string;
  /** 图片地址 */
  url?: string;
}

/** bing 网址 */
const BING_URL = "https://www.bing.com";

/** bing 壁纸地址 API */
const BING_API =
  `${BING_URL}/HPImageArchive.aspx?format=js&idx=0&n=8&uhd=1&uhdwidth=3840&uhdheight=2160`;

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
  const wallpaper = wallpapers.find((item) => item.enddate === enddate);
  // 没找到今天的壁纸
  if (wallpaper === undefined) {
    // 追加今天的壁纸
    const originUrl = url.slice(0, url.indexOf("&"));

    const wallpaper = {
      enddate: enddate,
      copyright,
      url: `${BING_URL}${originUrl}`,
    };
    wallpapers.push(wallpaper);
  }
});

// 格式化 json 并写入文件
const string = JSON.stringify(wallpapers, null, 2);
const path = "./fresh/routes/wallpapers.json";
Deno.writeTextFileSync(path, string);
console.log(`${path} 更新成功`);
