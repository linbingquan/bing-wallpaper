import data from "../data/wallpapers.json" with { type: "json" };
import type { Wallpaper } from "./wallpapers.ts";

/** Historical wallpaper data (original order, uncleaned) */
export const wallpapers: Wallpaper[] = data;
