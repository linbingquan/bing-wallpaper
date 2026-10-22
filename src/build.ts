import fs from "node:fs/promises";
import { cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { toSSG } from "hono/ssg";
import app from "./index.tsx";

const dir = fileURLToPath(new URL("../dist/", import.meta.url));

await rm(dir, { recursive: true, force: true });
await toSSG(app, fs, { dir });
// 静态资源：样式表不内联进 HTML，方便浏览器缓存
await cp(
  fileURLToPath(new URL("./styles.css", import.meta.url)),
  fileURLToPath(new URL("../dist/styles.css", import.meta.url)),
);

console.log(`build 完成 -> ${dir}`);
