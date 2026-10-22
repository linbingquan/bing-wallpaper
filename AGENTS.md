# AGENTS.md

## 包管理器

- 项目以 **npm + Node.js** 为准：脚本、CI 都用 `npm run`，锁文件是 `package-lock.json`（入库）。
- `bun.lock` 是本地用 bun 装依赖时产生的，已被 `.gitignore` 忽略，不要提交、不要改 CI 用 bun。

## 锁文件

本地 node_modules 由 bun 装（快），`package-lock.json` 由 npm 生成，两者互不影响：

```bash
bun add -d <pkg>                                    # 装依赖（本地 node_modules）
npm install --package-lock-only --prefer-offline    # 只更新 package-lock.json
```

- `--package-lock-only` 只写锁文件，不动 node_modules（不会把 bun 装的目录冲掉）。
- `--prefer-offline` 优先走缓存，锁文件已经是最新时基本是空跑。
- 不需要 `--loglevel verbose`：输出噪音大，对排查没有帮助。
- npm 12 会提示 `esbuild` 的 postinstall 被拦，`--package-lock-only` 本来就不跑脚本，忽略即可。

## 常用命令

```bash
bun install            # 本地装依赖（CI 用 npm install）
npm run wallpapers     # 拉取 bing 壁纸 -> packages/wallpapers/wallpapers.json
npm run markdown       # 由壁纸数据重新生成 README.md（生成物，别手改）
npm run build          # 生成静态站点 -> packages/hono/dist
npm run start          # build + 本地预览
npm run typecheck      # tsc --noEmit
npm test               # vitest run
```

## 结构

- `packages/wallpapers/mod.ts` —— 纯函数与类型（无副作用、可测）：`thumbnailUrl`、`sourceOf`、`dedupeById`、`normalize`、`recentWallpapers`
- `packages/wallpapers/data.ts` —— 读取 `wallpapers.json` 原始数据
- `packages/wallpapers/wallpapers.json` —— 历史壁纸，由脚本维护，不要手改
- `packages/hono/` —— Hono + `hono/ssg` 静态站点（名字叫 hono，其实是站点包）
- `scripts/` —— 数据抓取与 README 生成

## 约定

- 首页只渲染最近 `RECENT_LIMIT`（365）条壁纸，不要把全量数据一次性输出成 HTML。
- 壁纸 URL 存的是不带尺寸参数的原始地址，缩略图一律走 `thumbnailUrl(url, width)`。
- 样式是手写 CSS（`packages/hono/styles.css`），本项目不使用 Tailwind。
- `README.md` 是 `scripts/markdown.ts` 的产物。
