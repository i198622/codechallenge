import { Chart } from "react-google-charts";

// export const options = {
//   legend: "none",
//   pieSliceText: "label",
//   title: "Средняя оценка по PR",
//   pieStartAngle: 10,
// };


export interface IProps {
  data: any[];
  options: any;
}

export function ScorePieChart({ data, options }: IProps) {
  return (
    <Chart
      chartType="PieChart"
      data={data}
      options={options}
      width={"100%"}
      height={"400px"}
    />
  );
}

export function BarChart({ data, options }: IProps) {
  return (
    <Chart
      chartType="ColumnChart"
      width="100%"
      height="400px"
      data={data}
      options={options}
    />
  );
}