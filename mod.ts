interface IDataItem {
  enddate: number;
  copyright: string;
  url: string;
}

/** bing 网址 */
const BING_URL = "https://cn.bing.com";

/** bing 壁纸地址 API */
const BING_API = `${BING_URL}/HPImageArchive.aspx?format=js&idx=0&n=1&uhd=1&uhdwidth=3840&uhdheight=2160`;

const res: { images: IDataItem[] } = await fetch(BING_API).then((res) => res.json());

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

// 读取 data.json 文件
const text = Deno.readTextFile("./deploy/data.json");
const response = await text.then((response) => response, (err) => {
  console.warn(err);
  return `[]`; // 读取失败时创建
});

// 转换为 json 对象
const json = JSON.parse(response);

const tody_wallpaper = json.find((item: IDataItem) => item.enddate === Number(enddate));

// 没找到今天的壁纸
if (!tody_wallpaper) {
  // 追加今天的壁纸
  const img_url = url.slice(0, url.indexOf('&'));
  json.push({ enddate: Number(enddate), copyright, url: `${BING_URL}/${img_url}` });

  // 格式化为 jsonstring 格式
  const json_str = JSON.stringify(json, null, 4);

  // 追加写入 data.json 文件
  const write = Deno.writeTextFile("./deploy/data.json", json_str);
} else {
  console.log(`已存在今天的壁纸`);
}
