/** @jsx h */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { h, renderSSR } from "https://deno.land/x/nano_jsx/mod.ts";
import { Application } from "./application.ts";
import { logger, responseTime } from "./logger.ts";
import { Router } from "./router.ts";

export interface IDataItem {
  enddate: number;
  copyright: string;
  url: string;
  preview_url: string;
}

function App(props: any) {
  const datas: IDataItem[] = props.datas || [];
  const list = datas.map((item: IDataItem) => {
    return ListItem(item);
  });
  return (
    <html>
      <head>
        <title>bing-wallpaper</title>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <div class="bing-wallpaper">
          <div class="list">{list}</div>
        </div>
      </body>
    </html>
  );
}

function ListItem(data: IDataItem) {
  return (
    <div class="item">
      <a href={data.url} target="_blank">
        <img loading="lazy" src={data.preview_url} />
      </a>
      <div class="footer">
        <div class="enddate">{data.enddate}</div>
        <div class="copyright">{data.copyright}</div>
      </div>
    </div>
  );
}

const ContextType: Record<string, string> = {
  "css": "text/css",
  "json": "application/json; charset=UTF-8",
  "ico": "image/x-icon",
  "svg": "image/svg+xml",
  "html": "text/html; charset=utf-8",
  "txt": "text/plain",
};

const getHomePage = async () => {
  const datas = await getDatas();
  return renderSSR(<App datas={datas} />);
};

async function getDatas() {
  const text = await Deno.readTextFile("./deploy/data.json");
  const datas: IDataItem[] = JSON.parse(text);
  datas.forEach((item) =>
    item.preview_url = item.url + "&rf=LaDigue_UHD.jpg&w=400&c=1"
  );
  datas.sort((a, b) => b.enddate - a.enddate);
  return datas;
}

const page404 = async (ctx: any, next: Function) => {
  await next();
  if (ctx.reponse === undefined) {
    ctx.reponse = new Response(await getHomePage(), getResponseInit("html"));
  }
};

function getResponseInit(ext: string): ResponseInit | undefined {
  return {
    headers: {
      "content-type": ContextType[ext || "txt"],
    },
  };
}

const router = new Router();

router.get("/", async (ctx: any) => {
  ctx.reponse = new Response(await getHomePage(), getResponseInit("html"));
}).get("/style.css", async (ctx: any) => {
  const file = await Deno.readFile("./deploy/style.css");
  ctx.reponse = new Response(file, getResponseInit("css"));
}).get("/json", async (ctx: any) => {
  const file = await Deno.readFile("./deploy/data.json");
  ctx.reponse = new Response(file, getResponseInit("json"));
}).get("/favicon.ico", async (ctx: any) => {
  const file = await Deno.readFile("./deploy/favicon.ico");
  ctx.reponse = new Response(file, getResponseInit("ico"));
}).get("/logo.svg", async (ctx: any) => {
  const file = await Deno.readFile("./deploy/logo.svg");
  ctx.reponse = new Response(file, getResponseInit("svg"));
});

const app = new Application();

app.use(logger);
app.use(responseTime);
app.use(router.routes());
app.use(page404);

async function handler(request: Request) {
  const url = new URL(request.url);

  app.context = { request, url };

  await app.start();

  return app.context.reponse;
}

Deno.serve((request) => handler(request));
