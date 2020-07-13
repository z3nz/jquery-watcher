module.exports = {
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  rules: {
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.js',
        '**/tests/**/*.spec.js'
      ],
      env: {
        jest: true
      }
    }
  ]
}
