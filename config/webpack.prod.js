const path = require("path");
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

function getStyleLoader(preset) {
  return [
    MiniCssExtractPlugin.loader,
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
    path: path.resolve(__dirname, "../dist"),
    filename: "static/js/[name].[contenthash:10].js",
    chunkFilename: "static/js/[name].[contenthash:10].chunk.js",
    assetModuleFilename: "static/media/[hash:10][ext][query]",
    clean: true
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
          cacheCompression: false
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
    },
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin(),
      // new ImageMinimizerPlugin({
      //   minimizer: {
      //     implementation: ImageMinimizerPlugin.imageminMinify,
      //     options: {
      //       // Lossless optimization with custom option
      //       // Feel free to experiment with options for better result for you
      //       plugins: [
      //         ["gifsicle", { interlaced: true }],
      //         ["jpegtran", { progressive: true }],
      //         ["optipng", { optimizationLevel: 5 }],
      //         // Svgo configuration here https://github.com/svg/svgo#configuration
      //         [
      //           "svgo",
      //           {
      //             plugins: [
      //               {
      //                 name: "preset-default",
      //                 params: {
      //                   overrides: {
      //                     removeViewBox: false,
      //                     addAttributesToSVGElement: {
      //                       params: {
      //                         attributes: [
      //                           { xmlns: "http://www.w3.org/2000/svg" },
      //                         ],
      //                       },
      //                     },
      //                   },
      //                 },
      //               },
      //             ],
      //           },
      //         ],
      //       ],
      //     },
      //   },
      // }),
    ]
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

    new ReactRefreshWebpackPlugin(),

    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:10].css",
      chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
    }),

    new CopyPlugin({
      patterns: [
        { 
          from: path.resolve(__dirname, "../public"),
          to: path.resolve(__dirname, "../dist"),
          globOptions: {
            ignore: ["**/index.html"],
          },
        },
      ],
    }),
  ],

  mode: "production",
  devtool: "source-map",
}