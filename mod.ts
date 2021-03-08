/** 壁纸图片 */
interface ImageItem {
  /** 图片时间 */
  enddate: number;
  /** 图片版权 */
  copyright: string;
  /** 图片地址 */
  url: string;
}

/** bing 网址 */
const BING_URL = "https://www.bing.com";

/** bing 壁纸地址 API */
const BING_API =
  `${BING_URL}/HPImageArchive.aspx?format=js&idx=0&n=1&uhd=1&uhdwidth=3840&uhdheight=2160`;

const res: { images: ImageItem[] } = await fetch(BING_API)
  .then((res) => res.json());

const {
  images: [
    {
      url, // 图片地址
      enddate, // 图片时间
      copyright, // 图片版权
    },
  ],
} = res;

console.log({ url, enddate, copyright });

// 读取文件
const text = await Deno.readTextFile("./deploy/data.json")
  .catch((err) => {
    console.error(err);
    return `[]`; // 读取失败时创建
  });

// 转换为 json 对象
const json: ImageItem[] = JSON.parse(text);
// 查找最新的壁纸
const latestWallpaper = json.find((item) => item.enddate === Number(enddate));

// 没找到今天的壁纸
if (latestWallpaper === undefined) {
  // 追加今天的壁纸
  const originUrl = url.slice(0, url.indexOf("&"));
  json.push({
    enddate: Number(enddate),
    copyright,
    url: `${BING_URL}${originUrl}`,
  });

  // 格式化 json 并写入文件
  const string = JSON.stringify(json, null, 2);
  Deno.writeTextFile("./deploy/data.json", string)
    .catch((err) => console.error(err));
} else {
  console.log(`已存在今天的壁纸`);
}
