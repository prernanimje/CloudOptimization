import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * CostBreakdownPieChart - Visualizes the proportional cost of CPU, RAM, and Storage
 * Estimates based on usage weightings since cloud providers bill mostly on these.
 */
const CostBreakdownPieChart = ({ monthlyCost, cpuUsage, ramUsage, storageUsage }) => {
    // Simple heuristic for weighting costs based on their raw usage %
    // Normalizing so they sum up to total monthly cost
    const totalUsagePoints = Math.max(1, cpuUsage + ramUsage + storageUsage);

    const data = [
        { name: 'Compute (CPU)', value: (cpuUsage / totalUsagePoints) * monthlyCost, color: '#00f3ff' },
        { name: 'Memory (RAM)', value: (ramUsage / totalUsagePoints) * monthlyCost, color: '#ff00f3' },
        { name: 'Storage', value: (storageUsage / totalUsagePoints) * monthlyCost, color: '#2dd4bf' },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#18181b', border: '1px solid #3f3f46', padding: '12px', borderRadius: '20px', color: '#fff' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
                    <p style={{ margin: 0, color: payload[0].payload.color }}>
                        Estimated: ${payload[0].value.toFixed(2)} / mo
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '13px', color: '#a1a1aa' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CostBreakdownPieChart;
