import { describe, expect, it } from "bun:test";
import app from "./index.tsx";
import { RECENT_LIMIT } from "./wallpapers.ts";

describe("Homepage", () => {
  it("only renders the latest 365 items (RECENT_LIMIT)", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);

    const html = await res.text();
    const count = html.match(/class="wallpaper"/g)?.length ?? 0;
    expect(count).toBeGreaterThan(0);
    expect(count).toBe(RECENT_LIMIT);
  });

  it("uses external stylesheet instead of inline CSS", async () => {
    const html = await (await app.request("/")).text();
    expect(html).toContain('href="styles.css"');
    expect(html).not.toContain("<style>");
  });

  it("images have alt text", async () => {
    const html = await (await app.request("/")).text();
    expect(html).toMatch(/<img[^>]*alt="[^"]+"/);
  });
});
