import { recentWallpapers } from "@scope/wallpapers";
import { wallpapers } from "@scope/wallpapers/data";
import { Hono } from "hono";
import type { JSX } from "hono/jsx/jsx-runtime";
import Wallpaper from "./Wallpaper.tsx";

/** 首页只渲染最近 N 条，避免一次性输出上千个节点 */
const recent = recentWallpapers(wallpapers);

function App({ Component }: { Component: () => JSX.Element }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Bing 每日壁纸归档，收录 cn.bing.com 与 www.bing.com 的历史壁纸。"
        />
        <title>bing-wallpaper</title>
        <link rel="stylesheet" href="styles.css" />
        <link
          rel="author"
          href="林炳权,linbingquan,https://github.com/linbingquan/bing-wallpaper"
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}

function Gallery({ items, label }: { items: typeof recent.cn; label: string }) {
  return (
    <section class="bing-wallpaper" aria-label={label}>
      {items.map((item) => (
        <Wallpaper key={item.url} item={item} />
      ))}
    </section>
  );
}

function Home() {
  return (
    <>
      <Gallery items={recent.cn} label="Bing 壁纸（中文）" />
      <Gallery items={recent.www} label="Bing 壁纸（国际）" />
    </>
  );
}

const app = new Hono();

app.get("/", (c) => c.html(<App Component={Home} />));

export default app;
