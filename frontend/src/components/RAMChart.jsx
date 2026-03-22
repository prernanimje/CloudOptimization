/**
 * RAM Usage Line Chart Component
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const RAMChart = ({ data = [], loading = false }) => {
  const chartData = data.slice(0, 100).map((item, index) => ({
    time: index,
    ram: parseFloat(item.ram_usage),
  }));

  const hasData = chartData.length > 0;

  return (
    <div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff00f3" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#ff00f3" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              label={{ value: 'Hours ago', position: 'insideBottomRight', offset: -5 }}
              stroke="#a1a1aa"
            />
            <YAxis
              label={{ value: 'RAM %', angle: -90, position: 'insideLeftMiddle', fill: '#a1a1aa' }}
              domain={[0, 100]}
              stroke="#a1a1aa"
            />
            <Tooltip
              formatter={(value) => `${value.toFixed(2)}%`}
              labelFormatter={(label) => `${label}h ago`}
              contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="ram"
              stroke="#ff00f3"
              fill="url(#colorRam)"
              strokeWidth={3}
              name="RAM Usage %"
              isAnimationActive={true}
              animationDuration={400}
              style={{ filter: "drop-shadow(0px 0px 6px rgba(255, 0, 243, 0.5))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : loading ? (
        <div
          style={{
            height: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            opacity: 0.85,
          }}
          className="animate-pulse"
        >
          Loading RAM metrics...
        </div>
      ) : (
        <div
          style={{
            height: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            opacity: 0.75,
          }}
        >
          No recent RAM metrics.
        </div>
      )}
    </div>
  );
};

export default RAMChart;
