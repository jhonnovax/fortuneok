const CHART_COLORS_LIGHT_BG = [
  '#248824', // Green
  '#1f77b4', // Blue
  '#d62728', // Red
  '#b95b08', // Orange
  '#8c61b3', // Purple
  '#8c564b', // Brown
  '#e377c2', // Pink
  '#17becf', // Cyan
  '#727272', // Gray
  '#7a7a13', // Yellow-green
  '#000000', // Black — strong neutral
  '#d9117d', // Deep pink (distinct from #e377c2)
  '#857000', // Gold (brighter than #bcbd22)
  '#4b0082', // Indigo (much darker than #9467bd)
  '#008500', // Neon green (more vivid than #2ca02c)
  '#d93900', // Orange-red (different from #ff7f0e)
  '#40e0d0', // Bright turquoise (lighter than #17becf)
  '#a52a2a', // Reddish brown (darker than #8c564b)
  '#191970', // Midnight blue (much darker than #1f77b4)
  '#ff00ff'  // Pure magenta (brighter than #e377c2)
];

const CHART_COLORS_DARK_BG = [
  // Adjusted Original 10 (brighter versions if needed)
  '#34d058', // Bright green (was #2ca02c)
  '#4da6ff', // Bright blue (was #1f77b4)
  '#ff6262', // Vivid red (was #d62728)
  '#ff9933', // Lighter orange (was #ff7f0e)
  '#c084fc', // Soft violet (was #9467bd)
  '#ca8f70', // Light brown (was #8c564b)
  '#ff94d3', // Light pink (was #e377c2)
  '#3ee0f5', // Bright cyan (was #17becf)
  '#bfbfbf', // Light gray (was #7f7f7f)
  '#d6e04a', // Bright yellow-green (was #bcbd22)
  '#ffffff', // White (was #000000)
  '#ff69b4', // Lighter pink (was #ff1493)
  '#ffe135', // Banana yellow (was #ffd700)
  '#9370db', // Medium purple (was #4b0082)
  '#00ff7f', // Spring green (was #00ff00)
  '#ff7043', // Coral orange (was #ff4500)
  '#66ffff', // Pale turquoise (was #40e0d0)
  '#cd8162', // Sandy brown (was #a52a2a)
  '#778fff', // Soft indigo-blue (was #191970)
  '#ff66ff'  // Neon magenta (was #ff00ff)
];


export const getChartColors = (theme) => {
  return theme === 'light' 
    ? CHART_COLORS_LIGHT_BG 
    : CHART_COLORS_DARK_BG;
};
