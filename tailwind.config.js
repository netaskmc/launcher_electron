/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: [
        "Inter, sans-serif",
        {
          fontFeatureSettings: `"cv02", "cv03", "cv04", "cv05", "cv06", "cv11"`,
        },
      ],
    },
    extend: {
      colors: {
        "nt-black": "#1D1D1D",
        "nt-gray": "#333333",
        "nt-primary": "#ff58d0",
        "nt-secondary": "#cd3eff",
      },
    },
  },
  plugins: [],
};
