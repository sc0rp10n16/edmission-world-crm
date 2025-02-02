// components/telecaller/leads-by-status.tsx
"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = {
  'NEW': '#2563eb',
  'CONTACTED': '#7c3aed',
  'INTERESTED': '#16a34a',
  'NOT_INTERESTED': '#dc2626',
  'CONVERTED': '#059669',
  'LOST': '#9ca3af'
}

interface LeadsByStatusProps {
  data: Array<{
    status: string
    _count: { status: number }
  }>
}

export function LeadsByStatus({ data }: LeadsByStatusProps) {
  const chartData = data.map(item => ({
    name: item.status.replace('_', ' '),
    value: item._count.status
  }))

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name.replace(' ', '_') as keyof typeof COLORS]} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}