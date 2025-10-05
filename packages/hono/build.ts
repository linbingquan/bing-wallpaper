// build.ts
import app from "./index.tsx";
import { toSSG } from "hono/ssg";
import fs from "node:fs/promises";

const dir = "./dist";
const stat = Deno.statSync(dir);
if (stat.isDirectory) {
  Deno.removeSync(dir, { recursive: true });
}

toSSG(app, fs, { dir });
