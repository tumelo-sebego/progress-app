const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  pwa: {
    name: 'Behavior Tracking App',
    themeColor: '#50a65d',
    msTileColor: '#232323',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true
    }
  },
  devServer: {
    proxy: {
      "^/auth": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "^/tasks": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "^/progress": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
