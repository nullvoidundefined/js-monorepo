module.exports = {
  extends: '@react-native',
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
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    'prettier/prettier': 'off', // Disable prettier ESLint rule, use prettier separately
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
};

