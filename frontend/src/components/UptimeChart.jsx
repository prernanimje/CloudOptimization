/**
 * Uptime & Downtime Visualization Component
 */

import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export const UptimeVisualization = ({ uptimeHours = 720, downtimeHours = 0, status = 'healthy' }) => {
  const totalHours = uptimeHours + downtimeHours;
  const uptimePercent = totalHours > 0 ? (uptimeHours / totalHours) * 100 : 100;
  const downtimePercent = totalHours > 0 ? (downtimeHours / totalHours) * 100 : 0;

  const data = [
    { name: 'Uptime', value: uptimePercent },
    { name: 'Downtime', value: downtimePercent },
  ];

  // Calculate days and hours
  const uptimeDays = Math.floor(uptimeHours / 24);
  const uptimeHoursRem = uptimeHours % 24;
  const downtimeDays = Math.floor(downtimeHours / 24);
  const downtimeHoursRem = downtimeHours % 24;

  const COLORS = ['#00f3ff', 'rgba(255, 255, 255, 0.1)']; // Cyber Blue and Muted Ghost
  const availability = totalHours > 0 ? ((uptimeHours / totalHours) * 100).toFixed(2) : 100;

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '32px', alignItems: 'start' }}>

        {/* Left: Availability Donut Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-6">Availability</h3>
          <div style={{ position: 'relative', width: '100%', height: '220px' }}>
            {totalHours > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index]}
                          style={{ filter: index === 0 ? 'drop-shadow(0px 0px 8px rgba(0, 243, 255, 0.4))' : 'none' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Central Label */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#00f3ff', textShadow: '0 0 10px rgba(0, 243, 255, 0.3)' }}>
                    {uptimePercent.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Available
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data</div>
            )}
          </div>
        </div>

        {/* Right: Server Availability Details Stacked Vertically */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 className="text-lg font-semibold mb-6">Performance Logs</h3>

          {/* Uptime Card */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '20px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Total Uptime</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>{uptimeDays}d {uptimeHoursRem}h</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Status</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10b981' }}>Active</p>
            </div>
          </div>

          {/* Downtime Card */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '20px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Downtime Recorded</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>{downtimeDays}d {downtimeHoursRem}h</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Impact</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f59e0b' }}>{downtimePercent.toFixed(1)}%</p>
            </div>
          </div>

          {/* Availability % Card */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '20px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>SLA Compliance</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>{availability}%</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Grade</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#8b5cf6' }}>Platinum</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UptimeVisualization;
