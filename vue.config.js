// vue.config.js

const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  // 👇 importante para que Vue genere rutas relativas y no absolutas
  publicPath: './',

  devServer: {
    port: process.env.VUE_APP_FRONT_END_PORT || 8080, // usa la variable
    // port: process.env.VUE_APP_FRONT_END_BASE_URL || 8080, // usa la variable o default 8080
  },

  pluginOptions: {
    electronBuilder: {
      // Aquí cargas tu archivo principal de electron
      mainProcessFile: 'background.js',
      rendererProcessFile: 'src/main.js',
    }
  }
})
