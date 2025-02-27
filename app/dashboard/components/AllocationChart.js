'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Stocks', value: 45000 },
  { name: 'ETFs', value: 25000 },
  { name: 'Crypto', value: 15000 },
  { name: 'Real Estate', value: 10000 },
  { name: 'Cash', value: 5000 },
];

// Calculate total for percentages
const total = data.reduce((sum, item) => sum + item.value, 0);
// Add percentage to each item
const dataWithPercentage = data.map(item => ({
  ...item,
  percentage: ((item.value / total) * 100).toFixed(1)
}));

const COLORS = [
  '#006e00', // Primary green
  '#4338ca', // Indigo
  '#0891b2', // Cyan
  '#c026d3', // Fuchsia
  '#ea580c', // Orange
];

const RADIAN = Math.PI / 180;

// Render the percentage inside the slice
const renderPercentageLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-sm font-medium"
    >
      {percentage}%
    </text>
  );
};

// Render the external label with connecting line
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
  // Calculate the point on the pie edge
  const radius = outerRadius * 1.4; // Increase this value to push labels further out
  
  // Calculate end point for the label
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  // Calculate the point where line starts (on the pie)
  const startX = cx + (outerRadius * 0.95) * Math.cos(-midAngle * RADIAN);
  const startY = cy + (outerRadius * 0.95) * Math.sin(-midAngle * RADIAN);

  // Determine text anchor based on position
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <g>
      {/* Simple straight line */}
      <line
        x1={startX}
        y1={startY}
        x2={x}
        y2={y}
        stroke="hsl(var(--bc) / 0.5)"
        strokeWidth="1"
      />
      
      {/* Label text */}
      <text
        x={x}
        y={y}
        dy={-2}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-sm"
      >
        <tspan fontWeight="bold">{name}</tspan>
      </text>
      <text
        x={x}
        y={y}
        dy={16}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-sm"
      >
        ${value.toLocaleString()}
      </text>
    </g>
  );
};

export default function AllocationChart() {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderPercentageLabel}
            outerRadius={120}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="hsl(var(--b1))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            innerRadius={60}
            fill="none"
            dataKey="value"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 