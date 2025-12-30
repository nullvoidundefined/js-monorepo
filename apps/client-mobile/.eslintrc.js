module.exports = {
  root: true,
  extends: '@react-native',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react/jsx-sort-props': ['error', {
      callbacksLast: true,
      ignoreCase: true,
      noSortAlphabetically: false,
      reservedFirst: true,
      shorthandFirst: true,
    }],
    'sort-keys': ['error', 'asc', {
      caseSensitive: false,
      natural: true,
    }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
  ],
};

