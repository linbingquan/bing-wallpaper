import {
  image,
  link,
  Markdown,
} from "https://deno.land/x/deno_markdown@v0.2/mod.ts";
import { chunk } from "https://deno.land/std@0.224.0/collections/mod.ts";
import wallpapers from "./fresh/routes/wallpapers.json" with { type: "json" };

wallpapers.sort((a, b) => Number(b.enddate) - Number(a.enddate));

const markdown = new Markdown();

markdown
  .header("Bing Wallpaper", 1)
  .paragraph(
    link("https://bing-wallpaper.deno.dev", "https://bing-wallpaper.deno.dev"),
  )
  .header("Local Preview", 2)
  .codeBlock(`deno task start`, "bash")
  .header("Get Latest Bing Wallpaper", 2)
  .codeBlock("deno task wallpapers", "bash")
  .header("Latest Bing Wallpaper", 2)
  .write("./", "README");

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
if (wallpaper) markdown.paragraph(today(wallpaper)).write("./", "README");

markdown
  .table([
    [""],
    ...chunk(wallpapers.splice(0, 9).map(preview), 3),
  ])
  .write("./", "README", markdown.content.replaceAll(")\n", ")"));
