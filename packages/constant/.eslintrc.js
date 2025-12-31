module.exports = {
  extends: ['custom'],
  rules: {
    // Disable this rule due to a bug with TypeScript enums
    '@typescript-eslint/no-duplicate-enum-values': 'off',
    'sort-keys': ['error', 'asc', {
      caseSensitive: false,
      natural: true,
    }],
  },
};

