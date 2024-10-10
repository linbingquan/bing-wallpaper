interface Props {
  enddate: string | number;
  url: string;
  copyright: string;
}

export default function Wallpaper(props: Props) {
  return (
    <div class="wallpaper">
      <a href={props.url} target="_blank">
        <img loading="lazy" src={props.url + "&rf=LaDigue_UHD.jpg&w=400&c=1"} />
      </a>
      <div class="footer">
        <div>{props.enddate}</div>
        <div>{props.copyright}</div>
      </div>
    </div>
  );
}
