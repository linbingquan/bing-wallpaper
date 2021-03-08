import Wallpaper from "../islands/Wallpaper.tsx";
import wallpapers from "./wallpapers.json" with { type: "json" };

wallpapers.sort((a, b) => Number(b.enddate) - Number(a.enddate));

export default function Home() {
  return (
    <div class="bing-wallpaper">
      {wallpapers.map((item) => (
        <Wallpaper
          url={item.url}
          enddate={item.enddate}
          copyright={item.copyright}
        />
      ))}
    </div>
  );
}
