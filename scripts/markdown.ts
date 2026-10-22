import { writeFile } from "node:fs/promises";
import { wallpapers } from "../src/data.ts";
import { normalize, thumbnailUrl, type Wallpaper } from "../src/wallpapers.ts";

/** Number of preview items to show in README (excluding the latest) */
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
    await writeFile(url, `${this.content.trimEnd()}\n`, "utf8");
    return this;
  }
}

const website = "https://linbingquan.github.io/bing-wallpaper/";

// Do not mutate imported data to avoid polluting other callers in the same process
const latest: Wallpaper[] = normalize(wallpapers);

const markdown = new Markdown()
  .header("Bing Wallpaper", 1)
  .paragraph(link(website, website))
  .header("Local Preview", 2)
  .codeBlock("bun install\nbun run dev")
  .header("Get Latest Bing Wallpaper", 2)
  .codeBlock("bun run wallpapers")
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
  `README.md updated (${Math.min(latest.length, PREVIEW_COUNT + 1)} items)`,
);
