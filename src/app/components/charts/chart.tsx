import { Chart } from "react-google-charts";

// export const data = [
//   ["German", 5.85],
//   ["French", 1.66],
//   ["Italian", 0.316],
//   ["Romansh", 0.0791],
// ];

export const options = {
  legend: "none",
  pieSliceText: "label",
  title: "Средняя оценка по PR",
  pieStartAngle: 10,
};


export interface IProps {
  data: any[];
}

export function ScorePieChart({ data }: IProps) {
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
