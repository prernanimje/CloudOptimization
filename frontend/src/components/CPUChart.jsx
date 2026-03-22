/**
 * CPU Usage Line Chart Component
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

export const CPUChart = ({ data = [], loading = false }) => {
  // Format data for chart
  const chartData = data.slice(0, 100).map((item, index) => ({
    time: index,
    cpu: parseFloat(item.cpu_usage),
  }));

  const hasData = chartData.length > 0;

  return (
    <div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#00f3ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              label={{ value: 'Hours ago', position: 'insideBottomRight', offset: -5 }}
              stroke="#a1a1aa"
            />
            <YAxis
              label={{ value: 'CPU %', angle: -90, position: 'insideLeftMiddle', fill: '#a1a1aa' }}
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
              dataKey="cpu"
              stroke="#00f3ff"
              fill="url(#colorCpu)"
              strokeWidth={3}
              name="CPU Usage %"
              isAnimationActive={true}
              animationDuration={400}
              style={{ filter: "drop-shadow(0px 0px 6px rgba(0, 243, 255, 0.5))" }}
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
          Loading CPU metrics...
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
          No recent CPU metrics.
        </div>
      )}
    </div>
  );
};

export default CPUChart;
