module.exports = {
  root: true,
  extends: ['@react-native-community', '@react-native'],
  parser: '@babel/eslint-parser', // Babel ESLint parser
  parserOptions: {
    requireConfigFile: false, // Disable the need for a Babel config file if not found
    babelOptions: {
      presets: ['module:@react-native/babel-preset'], // Use the preset directly in ESLint
    },
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    // Add your custom rules here
  },
};
