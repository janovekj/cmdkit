/* eslint-disable no-undef */
module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === "production",
    safeList: [],
    content: ["./index.html", "./src/**/*.jsx", "./src/**/*.js"],
  },
  theme: {
    extend: {
      colors: {
        deepsea: "#0b1631",
        "deepsea-light": "#67779a",
      },
      maxHeight: {
        100: "25rem",
      },
    },
  },
  variants: {},
  plugins: [],
};
