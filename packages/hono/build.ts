import app from "./index.tsx";
import fs from "node:fs/promises";
import { rm } from "node:fs/promises";
import { toSSG } from "hono/ssg";

const dir = "./dist";
await rm(dir, { recursive: true, force: true });
await toSSG(app, fs, { dir });
