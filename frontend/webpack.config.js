const path = require("path");

module.exports = {
  // Other configuration options...
  resolve: {
    fallback: {
      os: require.resolve("os-browserify/browser"),
      fs: require.resolve("browserify-fs"),
    },
  },
  // Other configuration options...
};
