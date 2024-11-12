const path = require("path");
const { defineConfig } = require("@vue/cli-service");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin({ additionalAliases: ["process", "punycode"] }),
    ],
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    resolve: {
      alias: {
        process: "process/browser",
      },
      fallback: {
        os: require.resolve("os-browserify/browser"),
        fs: require.resolve("browserify-fs"),
        child_process: false,
        process: require.resolve("process/browser"),
      },
    },
  },
  transpileDependencies: true,
  outputDir: path.resolve(__dirname, "../../../var/www/html"),
  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },
  devServer: {
    proxy: {
      // Proxy requests prefixed with '/api' to the Node.js server
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
      // Proxy requests prefixed with '/flask-api' to the Flask server
      "/data": {
        target: "http://localhost:5001",
        changeOrigin: true,
        pathRewrite: {
          "^/data": "",
        },
      },
    },
  },
});
