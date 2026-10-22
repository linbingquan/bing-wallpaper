/** 本地预览 `dist/` 中的静态页面，替代 `serve` 依赖 */
const root = new URL("../dist/", import.meta.url);

/** 把请求路径映射到 dist 内的文件，越界（如 ../）时返回 undefined */
function resolve(pathname: string): URL | undefined {
  const file = new URL(`.${pathname === "/" ? "/index.html" : pathname}`, root);
  return file.href.startsWith(root.href) ? file : undefined;
}

const server = Bun.serve({
  async fetch(request) {
    const file = resolve(new URL(request.url).pathname);
    if (file === undefined || !(await Bun.file(file).exists())) {
      return new Response("404 Not Found", { status: 404 });
    }
    return new Response(Bun.file(file));
  },
});

console.log(`预览地址 -> ${server.url}`);
