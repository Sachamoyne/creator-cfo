"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "YouTube", value: 12000 },
  { name: "Stripe", value: 8500 },
  { name: "Patreon", value: 4200 },
  { name: "Autres", value: 2300 },
];

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

export default function RevenuePieChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(222 47% 11%)",
            border: "1px solid hsl(217 33% 17%)",
            borderRadius: "6px",
            color: "hsl(210 40% 98%)",
          }}
        />
        <Legend
          wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

