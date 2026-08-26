'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import { SpendingTrendPoint } from '../../services/dashboardApi';
import { formatCurrency, formatDate } from '../../lib/formatters';

interface SpendingTrendChartProps {
  data: SpendingTrendPoint[];
}

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          No spending trend data available yet.
        </p>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date,
    formattedDate: formatDate(d.date),
    amount: Number(d.amount)
  }));

  return (
    <Card style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Spending Trend Over Time
      </h3>
      <div style={{ flex: 1, width: '100%', minHeight: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              formatter={(val: any) => [formatCurrency(Number(val)), 'Spent']}
              contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
            <Area type="monotone" dataKey="amount" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#trendColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
