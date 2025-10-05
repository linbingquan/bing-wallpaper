import { wallpapers } from "@scope/wallpapers";
import { Hono } from "hono";
import type { JSX } from "hono/jsx/jsx-runtime";
import styles from "./dist/styles.css" with { type: "text" };
import Wallpaper from "./Wallpaper.tsx";

const cn = wallpapers.filter((item) => item.url.includes("cn.bing.com"));
const www = wallpapers.filter((item) => item.url.includes("www.bing.com"));

cn.sort((a, b) => Number(b.enddate) - Number(a.enddate));
www.sort((a, b) => Number(b.enddate) - Number(a.enddate));

function App({ Component }: { Component: () => JSX.Element }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>bing-wallpaper</title>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link
          rel="author"
          href="林炳权,linbingquan,https://github.com/linbingquan/bing-wallpaper"
        />
        <style>{styles}</style>
        <script type="text/javascript" src="/clarity.js"></script>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}

function Home() {
  return (
    <div>
      <div class="bing-wallpaper">
        {cn.map((item) => (
          <Wallpaper
            url={item.url}
            enddate={item.enddate}
            copyright={item.copyright}
          />
        ))}
      </div>
      <div class="bing-wallpaper">
        {www.map((item) => (
          <Wallpaper
            url={item.url}
            enddate={item.enddate}
            copyright={item.copyright}
          />
        ))}
      </div>
    </div>
  );
}

const app = new Hono();

app.get("/", (c) => {
  return c.html(<App Component={Home} />);
});

export default app;
