const path = require("path");
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

function getStyleLoader(preset) {
  return [
    "style-loader", 
    "css-loader",
    // Loader to process CSS with PostCSS. Deal with css compatibility
    // need browserslist as well, config in package.json file
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"]
        }
      }
    },
    preset
  ].filter(Boolean)
}

module.exports = {
  entry: "./src/index.js",

  output: {
    path: undefined,
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].chunk.js",
    assetModuleFilename: "static/media/[hash:10][ext][query]"
  },

  resolve: {
    extensions: [".jsx", "..."]
  },

  module: {
    rules: [
      // process styles
      {
        test: /\.css$/,
        use: getStyleLoader()
      },
      // process images
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024
          }
        }
      },
      // process other resource file ex: font family
      {
        test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
        type: "asset/resource",
      },
      // process js, jsx
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, "../src"),
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          cacheCompression: false,
          plugins: [ "react-refresh/babel" ] // HMR
        }
      }
    ],
  },

  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        react: {
          test: /[\\/]node_moodules[\\/]react(.*)?[\\/]$/,
          name: "chunk-react",
          priority: 40
        },
        libs: {
          test: /[\\/]node_moodules[\\/]$/,
          name: "chunk-libs",
          priority: 20
        }
      }
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`
    }
  },

  plugins: [
    new ESLintPlugin({
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules",
      cache: true
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html")
    }),

    new ReactRefreshWebpackPlugin()
  ],

  mode: "development",
  devtool: "cheap-module-source-map",
  devServer: {
    host: "localhost",
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true
  },
}