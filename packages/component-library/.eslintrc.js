module.exports = {
  extends: ['custom/react'],
  rules: {
    'sort-keys': ['error', 'asc', {
      caseSensitive: false,
      natural: true,
    }],
  },
};

