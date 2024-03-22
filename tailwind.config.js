/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      backgroundColor: {
        button: "#FFEDD5",
      },
      inset: {
        30: "120px",
        40: "160px",
        50: "200px",
      },
    },
  },
  plugins: [],
};
