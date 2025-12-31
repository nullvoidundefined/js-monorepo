module.exports = {
  extends: ['custom'],
  rules: {
    'sort-keys': ['error', 'asc', {
      caseSensitive: false,
      natural: true,
    }],
  },
};

