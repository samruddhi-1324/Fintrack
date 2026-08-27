'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card3D from '../ui/Card3D';
import { CategorySpendSummary } from '../../services/dashboardApi';
import { formatCurrency } from '../../lib/formatters';

interface CategoryPieChartProps {
  data: CategorySpendSummary[];
}

const COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#64748b'];

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card3D style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          No category spending data available yet.
        </p>
      </Card3D>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category_name,
    value: Number(d.amount)
  }));

  return (
    <Card3D style={{ height: '360px', display: 'flex', flexDirection: 'column' }} depth={25}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
        Spending by Category
      </h3>
      <div style={{ flex: 1, width: '100%', minHeight: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: any) => [formatCurrency(Number(val)), 'Amount']}
              contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
            <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card3D>
  );
}
