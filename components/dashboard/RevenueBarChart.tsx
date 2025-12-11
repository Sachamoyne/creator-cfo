"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", revenue: 4500 },
  { month: "Fév", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Avr", revenue: 6100 },
  { month: "Mai", revenue: 5500 },
  { month: "Juin", revenue: 6800 },
];

export default function RevenueBarChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="month" 
          stroke="#9ca3af"
          style={{ fontSize: "12px" }}
        />
        <YAxis 
          stroke="#9ca3af"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(222 47% 11%)",
            border: "1px solid hsl(217 33% 17%)",
            borderRadius: "6px",
            color: "hsl(210 40% 98%)",
          }}
        />
        <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

