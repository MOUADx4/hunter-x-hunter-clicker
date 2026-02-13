import { LineChart, Line, Tooltip } from "recharts";

export default function Stats({ cookies, cps }) {
  const data = [
    { name: "Now", value: cookies },
    { name: "+10s", value: cookies + cps * 10 },
    { name: "+30s", value: cookies + cps * 30 },
  ];

  return (
    <div>
      <h2>Stats Nen</h2>

      <LineChart width={250} height={120} data={data}>
        <Tooltip />
        <Line type="monotone" dataKey="value" strokeWidth={3} />
      </LineChart>
    </div>
  );
}

