module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './src',
          '@applyalert/contracts': '../../packages/contracts/src',
          '@applyalert/validation': '../../packages/validation/src',
        },
      },
    ],
  ],
};
