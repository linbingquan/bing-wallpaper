export interface IDataItem {
  enddate: number;
  copyright: string;
  url: string;
  preview_url: string;
}

const text = await Deno.readTextFile("./deploy/data.json");
const datas: IDataItem[] = JSON.parse(text);

datas.forEach(item => item.preview_url = item.url + '&rf=LaDigue_UHD.jpg&w=400&c=1')

datas.sort((a, b) => {
 return b.enddate - a.enddate
});

export default datas;
