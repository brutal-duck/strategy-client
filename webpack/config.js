const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  devServer: {
    port: dotenv.parsed.PORT
  },
  entry: './src/scripts/index.ts',
  output: {
    path: path.resolve(__dirname, '../build'),
  },
  mode: "development",
  devtool: "eval-source-map",
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ]
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    },
    {
      test: [/\.vert$/, /\.frag$/],
      use: "raw-loader"
    },
    {
      test: /\.(gif|png|jpe?g|svg|xml|mp3)$/i,
      use: "file-loader"
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: "file-loader",
    },
    {
      test: /\.(mov|mp4|3gp)$/,
      use: 'file-loader'
    },
    {
      test: /\.css$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader'],
    }]
  },
  plugins: [
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, "../")
    }),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      favicon: "./public/favicon.ico"
    }),
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(dotenv.parsed)
    }),
  ]
};
