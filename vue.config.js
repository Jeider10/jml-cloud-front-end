const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  // 👇 importante para que Vue genere rutas relativas y no absolutas
  publicPath: './',

  pluginOptions: {
    electronBuilder: {
      // Aquí cargas tu archivo principal de electron
      mainProcessFile: 'background.js',
      rendererProcessFile: 'src/main.js',
    }
  }
})
