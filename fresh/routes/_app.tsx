import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <title>bing-wallpaper</title>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/styles.css" />
        <link
          rel="author"
          href="https://github.com/linbingquan/bing-wallpaper"
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
