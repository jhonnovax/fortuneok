export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
};

export const getBreakpoint = (width) => {
  
  switch (true) {
    case width >= BREAKPOINTS["2XL"]:
      return "2xl";
    case width >= BREAKPOINTS.XL:
      return "xl";
    case width >= BREAKPOINTS.LG:
      return "lg";
    case width >= BREAKPOINTS.MD:
      return "md";
    case width >= BREAKPOINTS.SM:
      return "sm";
    default:
      return "xs"; // smaller than 640px
  }

};