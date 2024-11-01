import { type PageProps } from "$fresh/server.ts";
export default function App({ Component, url }: PageProps) {
  return (
    <html>
      <head>
        <title>bing-wallpaper</title>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/styles.css" />
        <link
          rel="author"
          href="林炳权,linbingquan,https://github.com/linbingquan/bing-wallpaper"
        />
        {url.host.includes("localhost") === false && (
          <script type="text/javascript" src="/clarity.js"></script>
        )}
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
