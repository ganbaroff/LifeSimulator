module.exports = {
  root: true,
  extends: [
    'universe/native',
    'plugin:react/recommended',
  ],
  plugins: ['react', 'react-native', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    es6: true,
    node: true,
    browser: true,
    'react-native/react-native': true,
  },
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/order': 'off',
  },
};
