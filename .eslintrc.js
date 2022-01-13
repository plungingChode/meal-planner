module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
  ],
  rules: {
    // General
    'indent': ['warn', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'always'],
    'react/jsx-closing-bracket-location': [1, 'tag-aligned'],

    // Testing
    'jest/no-mocks-import': 'off',
    'testing-library/no-wait-for-multiple-assertions': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      rules: {
        'indent': 'off',
        '@typescript-eslint/indent': ['warn', 2],
      }
    }
  ]
};