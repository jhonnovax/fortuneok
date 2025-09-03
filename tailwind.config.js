module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/globals.css", 
  ],

  theme: {
    extend: {
      fontFamily: {
        futura: ['FuturaPT', 'sans-serif'],
      }
    }
  },

  plugins: [
    require("daisyui")
  ],

  daisyui: {
    themes: [
      {
        bumblebee: {
          ...require("daisyui/src/theming/themes")["bumblebee"],
          primary: "#a9ff68",
        },
      },
      {
        dim: {
          ...require("daisyui/src/theming/themes")["dim"],
          primary: "#a9ff68",
        },
      }
    ],
    lightTheme: "bumblebee",
    darkTheme: "dim",
  },

};
