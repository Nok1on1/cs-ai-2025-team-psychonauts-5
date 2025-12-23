"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface TopicPerformanceChartProps {
  data: Array<{ topic: string; accuracy: number; totalQuestions: number }>
}

export function TopicPerformanceChart({ data }: TopicPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="topic" className="text-xs" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
        <YAxis className="text-xs" domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value.toFixed(0)}% (${props.payload.totalQuestions} questions)`,
            "Accuracy",
          ]}
        />
        <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
