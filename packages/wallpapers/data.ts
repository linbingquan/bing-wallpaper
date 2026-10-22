import data from "./wallpapers.json" with { type: "json" };
import type { Wallpaper } from "./mod.ts";

/** 历史壁纸数据（原始顺序，未清洗） */
export const wallpapers: Wallpaper[] = data;
