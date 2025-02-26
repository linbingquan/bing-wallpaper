import Wallpaper from "../islands/Wallpaper.tsx";
import wallpapers from "./wallpapers.json" with { type: "json" };

const cn = wallpapers.filter((item) => item.url.includes("cn.bing.com"));
const www = wallpapers.filter((item) => item.url.includes("www.bing.com"));

cn.sort((a, b) => Number(b.enddate) - Number(a.enddate));
www.sort((a, b) => Number(b.enddate) - Number(a.enddate));

export default function Home() {
  return (
    <div>
      <div class="bing-wallpaper">
        {cn.map((item) => (
          <Wallpaper
            url={item.url}
            enddate={item.enddate}
            copyright={item.copyright}
          />
        ))}
      </div>
      <div class="bing-wallpaper">
        {www.map((item) => (
          <Wallpaper
            url={item.url}
            enddate={item.enddate}
            copyright={item.copyright}
          />
        ))}
      </div>
    </div>
  );
}
