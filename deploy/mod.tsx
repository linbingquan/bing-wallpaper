// You need to import `h` factory function as Deno Deploy
// uses it instead of `React.createElement`
import { h } from "https://x.lcas.dev/preact@10.5.12/mod.js";
import { renderToString } from "https://x.lcas.dev/preact@10.5.12/ssr.js";
import datas, { IDataItem } from "./datas.ts";

function App() {
  const list = datas.map((item: IDataItem) => {
    return ListItem(item);
  });
  return (
    <html>
      <head>
        <title>bing-wallpaper</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <div className="bing-wallpaper">
          <div className="list">{list}</div>
        </div>
      </body>
    </html>
  );
}

function ListItem(data: IDataItem) {
  return (
    <div className="item">
      <a href={data.url} target="_blank">
        <img loading="lazy" src={data.preview_url} />
      </a>
      <div className="footer">
        <div className="enddate">{data.enddate}</div>
        <div className="copyright">{data.copyright}</div>
      </div>
    </div>
  );
}

async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);

  // This is how the server works:
  // 1. A request comes in for a specific asset.
  // 2. We read the asset from the file system.
  // 3. We send the asset back to the client.

  // Check if the request is for style.css.
  if (pathname.startsWith("/style.css")) {
    // Read the style.css file from the file system.
    const file = await Deno.readFile("./deploy/style.css");
    // Respond to the request with the style.css file.
    return new Response(file, {
      headers: {
        "content-type": "text/css",
      },
    });
  }

  // Respond with JSON
  if (pathname.startsWith("/json")) {
    // Read the data.json file from the file system.
    const file = await Deno.readFile("./deploy/data.json");

    return new Response(file, {
      headers: {
        "content-type": "application/json; charset=UTF-8",
      },
    });
  }

  // renderToString generates html string from JSX components.
  return new Response(renderToString(<App />), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
