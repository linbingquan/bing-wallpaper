import { describe, expect, it } from "vitest";
import {
  dedupeById,
  imageId,
  normalize,
  recentWallpapers,
  sourceOf,
  thumbnailUrl,
  type Wallpaper,
} from "./mod.ts";

const cn = "https://cn.bing.com/th?id=OHR.A_ZH-CN1_UHD.jpg";
const www = "https://www.bing.com/th?id=OHR.B_EN-US2_UHD.jpg";

const wallpaper = (url: string, enddate: string): Wallpaper => ({
  url,
  enddate,
  copyright: `copyright ${enddate}`,
});

describe("imageId", () => {
  it("取出 id 参数", () => {
    expect(imageId(cn)).toBe("OHR.A_ZH-CN1_UHD.jpg");
  });

  it("非法地址返回 undefined", () => {
    expect(imageId("not a url")).toBeUndefined();
    expect(imageId("https://www.bing.com/th")).toBeUndefined();
  });
});

describe("sourceOf", () => {
  it("区分 cn 与 www", () => {
    expect(sourceOf(cn)).toBe("cn");
    expect(sourceOf(www)).toBe("www");
  });

  it("未知来源返回 undefined", () => {
    expect(sourceOf("https://example.com/th?id=1")).toBeUndefined();
    expect(sourceOf("")).toBeUndefined();
  });
});

describe("thumbnailUrl", () => {
  it("补上尺寸参数", () => {
    expect(thumbnailUrl(cn, 400)).toBe(
      `${cn}&rf=LaDigue_UHD.jpg&w=400&c=1`,
    );
  });

  it("重复调用不会叠加参数", () => {
    const once = thumbnailUrl(cn, 400);
    expect(thumbnailUrl(once, 272)).toBe(
      `${cn}&rf=LaDigue_UHD.jpg&w=272&c=1`,
    );
  });

  it("缺少 query 的地址也能拼出合法参数", () => {
    expect(thumbnailUrl("https://www.bing.com/th", 400)).toBe(
      "https://www.bing.com/th?rf=LaDigue_UHD.jpg&w=400&c=1",
    );
  });
});

describe("normalize", () => {
  it("按日期倒序并去掉脏数据", () => {
    const result = normalize([
      wallpaper(cn, "20260101"),
      wallpaper(www, "20260103"),
      { enddate: "", copyright: "", url: "" },
      { enddate: "2026", copyright: "", url: www },
    ]);
    expect(result.map((item) => item.enddate)).toEqual(["20260103", "20260101"]);
  });
});

describe("dedupeById", () => {
  it("同一个 id 只保留第一条", () => {
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
  it("只取最近 limit 条并按来源分组", () => {
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

  it("默认上限为 200", () => {
    const items = Array.from({ length: 300 }, (_, index) =>
      wallpaper(
        `https://www.bing.com/th?id=OHR.W${index}_EN-US_UHD.jpg`,
        `2026${String(index).padStart(4, "0")}`,
      ),
    );
    const { www: wwwItems } = recentWallpapers(items);
    expect(wwwItems).toHaveLength(200);
  });
});
