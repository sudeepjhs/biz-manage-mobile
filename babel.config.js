module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@lib': './src/lib',
          '@store': './src/store',
          '@hooks': './src/hooks',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@components': './src/components',
          '@types': './src/types',
          "@config": "./src/config",
        },
      },
    ],
    '@babel/plugin-transform-export-namespace-from',
  ],
};
