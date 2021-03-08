import {
  image,
  link,
  Markdown,
} from "https://deno.land/x/deno_markdown/mod.ts";
import { chunk } from "https://deno.land/std/collections/mod.ts";
import datas from "./deploy/data.json" assert { type: "json" };

datas.sort((a, b) => b.enddate - a.enddate);

const markdown = new Markdown();

markdown
  .header("Bing Wallpaper", 1)
  .paragraph(
    link("https://bing-wallpaper.deno.dev", "https://bing-wallpaper.deno.dev"),
  )
  .header("Start the service", 2)
  .codeBlock(
    "deno task dev",
    "bash",
  )
  .header("Get Latest Bing Wallpaper", 2)
  .codeBlock("deno task build", "bash")
  .header("Latest Bing Wallpaper", 2)
  .write("./", "README");

const today = (item: any) =>
  image(`${item.enddate}`, item.url += "&rf=LaDigue_UHD.jpg&w=830&c=1");

markdown.paragraph(
  today(datas.shift()),
)
  .write("./", "README");

datas.forEach((item) => item.url += "&rf=LaDigue_UHD.jpg&w=400&c=1");

markdown
  .table(
    [
      [""],
      ...chunk(
        datas.splice(0, 9).map(
          (item) => image(`${item.enddate}`, item.url),
        ),
        3,
      ),
    ],
  )
  .write("./", "README", markdown.content.replaceAll(")\n", ")"));
