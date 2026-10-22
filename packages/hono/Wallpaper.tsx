import {
  thumbnailUrl,
  type Wallpaper as WallpaperData,
} from "@scope/wallpapers";

interface Props {
  item: WallpaperData;
}

export default function Wallpaper({ item }: Props) {
  const alt = item.copyright || item.enddate;
  return (
    <div class="wallpaper">
      <a href={item.url} target="_blank" rel="noreferrer noopener">
        <img
          loading="lazy"
          decoding="async"
          src={thumbnailUrl(item.url, 400)}
          alt={alt}
          width="400"
          height="225"
        />
      </a>
      <div class="footer">
        <div class="enddate">{item.enddate}</div>
        <div class="copyright" title={item.copyright}>
          {item.copyright}
        </div>
      </div>
    </div>
  );
}
