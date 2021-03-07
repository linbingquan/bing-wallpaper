/** bing 网址 */
const BING_URL = "https://cn.bing.com";

/** bing 壁纸地址 API */
const BING_API = `${BING_URL}/HPImageArchive.aspx?format=js&idx=0&n=1&uhd=1&uhdwidth=3840&uhdheight=2160`;

const {
  images: [
    {
      url, // 图片地址
      enddate, // 图片时间
      copyright // 图片版权
    }
  ]
} = await fetch(BING_API).then((res) => res.json());// 读取 README.md

// 读取 README.md 文件
const text = Deno.readTextFile("./README.md");
const response = await text.then((response) => response, () => {
  return `## Bing Wallpaper\n\n---`; // 读取失败时创建
});

// 格式化为 markdown 格式
const markdown = `\n\n${enddate} | [${copyright}](${BING_URL}/${url})`;

// 追加写入 README.md 文件
const write = Deno.writeTextFile("./README.md", `${response}${markdown}`);