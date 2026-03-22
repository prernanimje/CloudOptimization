/**
 * Storage Usage Bar Chart & Disk Visual Component
 */

import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './StorageChart.css';

export const StorageChart = ({ storageUsage = 0, storageCapacity = 50 }) => {
  const radialData = [
    {
      name: 'Storage',
      value: storageUsage,
      fill: '#bf00ff',
    },
  ];

  // Use a consistent neon purple for storage
  const storageColor = '#bf00ff';
  const storageGlow = 'rgba(191, 0, 255, 0.5)';

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '40px', alignItems: 'start' }}>

        {/* Left: Radial Bar Gauge */}
        <div>
          <h3 className="text-lg font-semibold mb-6">Storage Usage</h3>
          <div style={{ position: 'relative', width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={15}
                data={radialData}
                startAngle={225}
                endAngle={-45}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: '#1f1f23' }}
                  dataKey="value"
                  cornerRadius={10}
                  style={{ filter: `drop-shadow(0px 0px 8px ${storageGlow})` }}
                />
                <Tooltip
                  formatter={(value) => `${value.toFixed(1)}%`}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Central Label */}
            <div style={{
              position: 'absolute',
              top: '55%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {storageUsage.toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Used
              </div>
            </div>
          </div>
        </div>

        {/* Right: Disk Space Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'flex-start' }}>
          <div>
            <h3 className="text-lg font-semibold mb-6">Disk Space Details</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Managed Capacity
                  </span>
                  <span className="text-sm font-bold text-[#bf00ff]">
                    {storageCapacity} GB
                  </span>
                </div>
                <div className="w-full bg-[#1f1f23] rounded-full h-4 overflow-hidden border border-[var(--border-color)]">
                  <div
                    className="storage-progress-bar"
                    style={{
                      width: `${storageUsage}%`,
                      backgroundColor: storageColor,
                      boxShadow: `0 0 10px ${storageGlow}`,
                      height: '100%',
                      transition: 'width 0.5s ease-out'
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[var(--text-secondary)]">
                    Used: {(storageCapacity * storageUsage / 100).toFixed(1)} GB
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Available: {(storageCapacity * (100 - storageUsage) / 100).toFixed(1)} GB
                  </span>
                </div>
              </div>

              {/* Status message */}
              <div className="mt-4 p-3 rounded-lg border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)]">
                {storageUsage >= 95 && (
                  <p className="flex items-center gap-2" style={{ color: '#ff003c', fontWeight: '600', fontSize: '0.85rem' }}>
                    <span>🚨</span> CRITICAL: System storage full
                  </p>
                )}
                {storageUsage >= 80 && storageUsage < 95 && (
                  <p className="flex items-center gap-2" style={{ color: '#ff7f00', fontWeight: '600', fontSize: '0.85rem' }}>
                    <span>⚠️</span> WARNING: Running dangerously low
                  </p>
                )}
                {storageUsage >= 60 && storageUsage < 80 && (
                  <p className="flex items-center gap-2" style={{ color: '#ccff00', fontWeight: '600', fontSize: '0.85rem' }}>
                    <span>ℹ️</span> Moderate storage consumption
                  </p>
                )}
                {storageUsage < 60 && (
                  <p className="flex items-center gap-2" style={{ color: '#39ff14', fontWeight: '600', fontSize: '0.85rem' }}>
                    <span>✓</span> Storage health is optimal
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageChart;
