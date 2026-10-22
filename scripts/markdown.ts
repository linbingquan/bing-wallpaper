import { normalize, thumbnailUrl, type Wallpaper } from "@scope/wallpapers";
import { wallpapers } from "@scope/wallpapers/data";
import { writeFile } from "node:fs/promises";

/** README 中除最新列表外展示的条数 */
const PREVIEW_COUNT = 9;

function link(text = "", url = "") {
  return `[${text}](${url})`;
}

function image(alt = "", src = "") {
  return `![${alt}](${src})`;
}

class Markdown {
  content = "";
  header(content = "", level = 1) {
    this.content += `${"#".repeat(level)} ${content}\n\n`;
    return this;
  }
  paragraph(content = "") {
    this.content += `${content}\n\n`;
    return this;
  }
  codeBlock(content = "", language = "bash") {
    this.content += "```" + language + "\n" + content + "\n```\n\n";
    return this;
  }
  async write(url: URL) {
    await writeFile(url, this.content, "utf8");
    return this;
  }
}

const website = "https://linbingquan.github.io/bing-wallpaper/";

// 不修改导入的数据，避免污染同进程中的其它调用方
const latest: Wallpaper[] = normalize(wallpapers);

const markdown = new Markdown()
  .header("Bing Wallpaper", 1)
  .paragraph(link(website, website))
  .header("Local Preview", 2)
  .codeBlock("npm install\nnpm run start")
  .header("Get Latest Bing Wallpaper", 2)
  .codeBlock("npm run wallpapers")
  .header("Latest Bing Wallpaper", 2);

const today = latest[0];
if (today !== undefined) {
  markdown.paragraph(image(today.enddate, thumbnailUrl(today.url, 900)));
}

markdown.paragraph(
  latest
    .slice(1, PREVIEW_COUNT + 1)
    .map((item) => image(item.enddate, thumbnailUrl(item.url, 272)))
    .join("\n"),
);

await markdown.write(new URL("../README.md", import.meta.url));
console.log(
  `README.md 更新成功（${Math.min(latest.length, PREVIEW_COUNT + 1)} 条）`,
);
