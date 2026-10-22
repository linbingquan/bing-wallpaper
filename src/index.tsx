import { Hono } from "hono";
import type { JSX } from "hono/jsx/jsx-runtime";
import { wallpapers } from "./data.ts";
import Wallpaper from "./Wallpaper.tsx";
import { recentWallpapers } from "./wallpapers.ts";

/** Only render the latest N items on the homepage to avoid rendering thousands of nodes at once */
const recent = recentWallpapers(wallpapers);

function App({ Component }: { Component: () => JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Bing daily wallpaper archive, collecting historical wallpapers from cn.bing.com and www.bing.com."
        />
        <title>bing-wallpaper</title>
        <link rel="stylesheet" href="styles.css" />
        <link
          rel="author"
          href="Bing Wallpaper Archive, 林炳权, linbingquan, https://github.com/linbingquan/bing-wallpaper"
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
      <Gallery items={recent.cn} label="Bing Wallpaper (Chinese)" />
      <Gallery items={recent.www} label="Bing Wallpaper (International)" />
    </>
  );
}

const app = new Hono();

app.get("/", (c) => c.html(<App Component={Home} />));

export default app;
