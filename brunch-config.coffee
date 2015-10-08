module.exports = config:

  files:
    javascripts:
      joinTo:
        'tags.js': /^app[\\\/].+\.tag/
        'background.js': /^vendor[\\\/]background\.js/
        'popup.js': /^vendor[\\\/]popup\.js/
        'vendor.js': /^vendor[\\\/](rg.min|riot)\.js/
        'phoenix.js': /^app[\\\/]phoenix\.es6/
      order:
        before: [
          'vendor/riot.js',
          'vendor/rg.min.js'
        ]

  plugins:
    on: ["riot"]
    riot:
      extension: 'tag'   # pattern overrides extension
      pattern: /\.tag$/  # default

    babel:
      pattern: /\.(es6|jsx)$/
