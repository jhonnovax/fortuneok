'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label
} from 'recharts';

const data = [
  { name: 'Stocks', value: 45000, percentage: 45 },
  { name: 'ETFs', value: 25000, percentage: 25 },
  { name: 'Crypto', value: 15000, percentage: 15 },
  { name: 'Real Estate', value: 10000, percentage: 10 },
  { name: 'Cash', value: 5000, percentage: 5 },
];

const COLORS = [
  'hsl(var(--p))',
  'hsl(var(--s))',
  'hsl(var(--a))',
  'hsl(var(--er))',
  'hsl(var(--wa))',
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value, percentage }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const alignmentBaseline = sin >= 0 ? 'bottom' : 'top';

  return (
    <text 
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline={alignmentBaseline}
      className="text-xs fill-base-content"
    >
      <tspan x={x} dy="0" fontWeight="bold">{name}</tspan>
      <tspan x={x} dy="15">${value.toLocaleString()}</tspan>
      <tspan x={x} dy="15">{percentage}%</tspan>
    </text>
  );
};

export default function AllocationChart() {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="hsl(var(--b1))"
                strokeWidth={2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 