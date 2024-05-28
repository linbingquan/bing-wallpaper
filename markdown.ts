import { chunk } from "$std/collections/mod.ts";
import wallpapers from "./fresh/routes/wallpapers.json" with { type: "json" };

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
  table(rows: string[][]) {
    this.content += rows.map((row) => row.join("")).join("\n\n");
    return this;
  }
  async write(path = "./", fileName = "REAME", content = this.content) {
    const file = await Deno.create(`${path}${fileName}.md`);
    const data = new TextEncoder().encode(content);
    await file.write(data);
    await file.close();
    return this;
  }
}

wallpapers.sort((a, b) => Number(b.enddate) - Number(a.enddate));

const markdown = new Markdown();

const website = "https://bing-wallpaper.deno.dev";

markdown
  .header("Bing Wallpaper", 1)
  .paragraph(link(website, website))
  .header("Local Preview", 2)
  .codeBlock(`deno task start`)
  .header("Get Latest Bing Wallpaper", 2)
  .codeBlock("deno task wallpapers")
  .header("Latest Bing Wallpaper", 2);

type Wallpaper = {
  enddate: string;
  url: string;
  copyright: string;
};

const today = (item: Wallpaper) =>
  image(`${item.enddate}`, item.url += "&rf=LaDigue_UHD.jpg&w=830&c=1");

const preview = (item: Wallpaper) =>
  image(`${item.enddate}`, item.url += "&rf=LaDigue_UHD.jpg&w=250&c=1");

const wallpaper = wallpapers.shift();
if (wallpaper) markdown.paragraph(today(wallpaper));

markdown.table([...chunk(wallpapers.splice(0, 9).map(preview), 3)]);

markdown.write();
