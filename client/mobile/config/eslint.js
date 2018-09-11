module.exports = {
  env: {
    browser: true,
    node: false,
  },
  parser: 'babel-eslint',
  extends: 'airbnb',
  plugins: ['react', 'jsx-a11y', 'import'],
  rules: {
    'react/jsx-filename-extension': ['off'],
    'linebreak-style': ['off'],
    'no-undef': ['error'],
    'react/sort-comp': ['off'],
    'react/prefer-stateless-function': ['off'],
    semi: ['off'],
    'import/no-unresolved': ['off'],
    'comma-dangle': ['error', 'always-multiline'],
  },
  globals: {
    it: 0,
    expect: 0,
    describe: 0,
    module: 0,
    navigator: 0,
    $Values: 0,
  },
}
