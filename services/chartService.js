const CHART_COLORS_LIGHT_BG = [
  '#1f77b4', // Blue
  '#d62728', // Red
  '#2ca02c', // Green
  '#ff7f0e', // Orange
  '#9467bd', // Purple
  '#8c564b', // Brown
  '#e377c2', // Pink
  '#17becf', // Cyan
  '#7f7f7f', // Gray
  '#bcbd22', // Yellow-green
];

const CHART_COLORS_DARK_BG = [
  '#4cc9f0', // Light Blue
  '#f72585', // Pink
  '#b5e48c', // Light Green
  '#ffd166', // Light Orange
  '#9d4edd', // Violet
  '#f9844a', // Coral
  '#06d6a0', // Mint
  '#ffb4a2', // Soft Red
  '#c77dff', // Lavender
  '#ffee32', // Bright Yellow
];

export const getChartColors = (theme) => {
  return theme === 'light' 
    ? CHART_COLORS_LIGHT_BG 
    : CHART_COLORS_DARK_BG;
};
