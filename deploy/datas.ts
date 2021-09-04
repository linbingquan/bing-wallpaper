export interface IDataItem {
  enddate: number;
  copyright: string;
  url: string;
}

const text = await Deno.readTextFile("./deploy/data.json");
const datas: IDataItem[] = JSON.parse(text);

datas.sort((a, b) => {
 return b.enddate - a.enddate
});

export default datas;
