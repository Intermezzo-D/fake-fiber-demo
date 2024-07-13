module.exports = {
  extends: ["react-app"], // adhere react official rules
  parserOptions: {
    babelOptions: {
      presets: [
        ["babel-preset-react-app", false],
        "babel-preset-react-app/prod"
      ]
    }
  }
}