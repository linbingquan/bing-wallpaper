import { describe, expect, it } from "bun:test";
import {
  dedupeById,
  imageId,
  normalize,
  recentWallpapers,
  sourceOf,
  thumbnailUrl,
  type Wallpaper,
} from "./wallpapers.ts";

const cn = "https://cn.bing.com/th?id=OHR.A_ZH-CN1_UHD.jpg";
const www = "https://www.bing.com/th?id=OHR.B_EN-US2_UHD.jpg";

const wallpaper = (url: string, enddate: string): Wallpaper => ({
  url,
  enddate,
  copyright: `copyright ${enddate}`,
});

describe("imageId", () => {
  it("extracts the id param", () => {
    expect(imageId(cn)).toBe("OHR.A_ZH-CN1_UHD.jpg");
  });

  it("returns undefined for invalid URLs", () => {
    expect(imageId("not a url")).toBeUndefined();
    expect(imageId("https://www.bing.com/th")).toBeUndefined();
  });
});

describe("sourceOf", () => {
  it("distinguishes cn from www", () => {
    expect(sourceOf(cn)).toBe("cn");
    expect(sourceOf(www)).toBe("www");
  });

  it("returns undefined for unknown sources", () => {
    expect(sourceOf("https://example.com/th?id=1")).toBeUndefined();
    expect(sourceOf("")).toBeUndefined();
  });
});

describe("thumbnailUrl", () => {
  it("adds size parameters", () => {
    expect(thumbnailUrl(cn, 400)).toBe(`${cn}&rf=LaDigue_UHD.jpg&w=400&c=1`);
  });

  it("doesn't duplicate params on repeated calls", () => {
    const once = thumbnailUrl(cn, 400);
    expect(thumbnailUrl(once, 272)).toBe(`${cn}&rf=LaDigue_UHD.jpg&w=272&c=1`);
  });

  it("generates valid params for URLs without query", () => {
    expect(thumbnailUrl("https://www.bing.com/th", 400)).toBe(
      "https://www.bing.com/th?rf=LaDigue_UHD.jpg&w=400&c=1",
    );
  });
});

describe("normalize", () => {
  it("sorts by date descending and filters invalid data", () => {
    const result = normalize([
      wallpaper(cn, "20260101"),
      wallpaper(www, "20260103"),
      { enddate: "", copyright: "", url: "" },
      { enddate: "2026", copyright: "", url: www },
    ]);
    expect(result.map((item) => item.enddate)).toEqual([
      "20260103",
      "20260101",
    ]);
  });
});

describe("dedupeById", () => {
  it("keeps only the first occurrence of each id", () => {
    const result = dedupeById([
      wallpaper(cn, "20260101"),
      wallpaper(cn, "20260102"),
      wallpaper(www, "20260103"),
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]?.enddate).toBe("20260101");
  });
});

describe("recentWallpapers", () => {
  it("takes only the latest N items and groups by source", () => {
    const items = Array.from({ length: 10 }, (_, index) =>
      wallpaper(
        `https://cn.bing.com/th?id=OHR.CN${index}_ZH-CN_UHD.jpg`,
        `202601${String(index + 1).padStart(2, "0")}`,
      ),
    );
    const { cn: cnItems, www: wwwItems } = recentWallpapers(items, 3);
    expect(cnItems.map((item) => item.enddate)).toEqual([
      "20260110",
      "20260109",
      "20260108",
    ]);
    expect(wwwItems).toEqual([]);
  });

  it("defaults to a limit of 365", () => {
    const items = Array.from({ length: 366 }, (_, index) =>
      wallpaper(
        `https://www.bing.com/th?id=OHR.W${index}_EN-US_UHD.jpg`,
        `2026${String(index).padStart(4, "0")}`,
      ),
    );
    const { www: wwwItems } = recentWallpapers(items);
    expect(wwwItems).toHaveLength(365);
  });
});
