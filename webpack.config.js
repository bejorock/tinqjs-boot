const path = require("path");
const NpmDtsPlugin = require("npm-dts-webpack-plugin");

module.exports = {
  mode: "development",
  target: "node",
  entry: {
    index: "./src/index.ts",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
              },
            },
          },
        },
      },
    ],
  },
  plugins: [
    new NpmDtsPlugin({
      entry: "src/index.ts",
      output: "dist/index.d.ts",
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: {
      type: "commonjs2",
    },
  },
  watch: false,
};
