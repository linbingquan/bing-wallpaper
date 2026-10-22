/** Serves static pages from `dist/` for local preview (replaces `serve` dependency) */
const root = new URL("../dist/", import.meta.url);

/** Maps a request path to a file under dist; returns undefined for out-of-bounds paths (e.g. ../) */
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

console.log(`Preview URL -> ${server.url}`);
