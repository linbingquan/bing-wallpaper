import { describe, expect, it } from "bun:test";
import app from "./index.tsx";
import { RECENT_LIMIT } from "./wallpapers.ts";

describe("首页", () => {
  it("只渲染最近 365 条（RECENT_LIMIT）", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);

    const html = await res.text();
    const count = html.match(/class="wallpaper"/g)?.length ?? 0;
    expect(count).toBeGreaterThan(0);
    expect(count).toBe(RECENT_LIMIT);
  });

  it("引用外部样式表而不是内联整份 CSS", async () => {
    const html = await (await app.request("/")).text();
    expect(html).toContain('href="styles.css"');
    expect(html).not.toContain("<style>");
  });

  it("图片带有 alt", async () => {
    const html = await (await app.request("/")).text();
    expect(html).toMatch(/<img[^>]*alt="[^"]+"/);
  });
});
