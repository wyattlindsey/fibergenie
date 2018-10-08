module.exports = {
  env: {
    browser: false,
    node: true,
  },
  parser: 'babel-eslint',
  rules: {
    'eol-last': 'warn',
    'no-alert': 'warn',
    'no-case-declarations': 'warn',
    'no-cond-assign': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-extra-boolean-cast': 'warn',
    'no-global-assign': 'error',
    'no-invalid-this': 'warn',
    'no-lonely-if': 'warn',
    'no-mixed-spaces-and-tabs': 'warn',
    'no-return-assign': ['error', 'always'],
    'no-tabs': 'warn',
    'no-trailing-spaces': 'warn',
    'no-unneeded-ternary': 'warn',
    'no-unsafe-negation': 'error',
    'no-useless-return': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'prefer-template': 'warn',
    'require-await': 'warn',
    yoda: 'warn',

    strict: 0,
  },
}