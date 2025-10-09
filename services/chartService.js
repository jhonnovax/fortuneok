const CHART_COLORS_LIGHT_BG = [
  '#1f77b4', // Blue
  '#d62728', // Red
  '#248824', // Green
  '#b95b08', // Orange
  '#8c61b3', // Purple
  '#8c564b', // Brown
  '#a4558c', // Pink
  '#0e828e', // Cyan
  '#727272', // Gray
  '#bcbd22', // Yellow-green
];

const CHART_COLORS_DARK_BG = [
  '#4cc9f0', // Light Blue
  '#ff3cf2', // Pink
  '#b5e48c', // Light Green
  '#ffd166', // Light Orange
  '#d96aff', // Violet
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
