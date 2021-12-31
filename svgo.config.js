module.exports = {
  plugins: [
    'removeXMLProcInst',
    'removeComments',
    'removeStyleElement',
    {
      name: 'removeAttrs',
      params: {
        elemSeparator: '~',
        attrs: ['fill', 'fill-rule', 'version', 'id', 'x', 'y', 'class', 'style', 'xml:space', 'xmlns:xlink']
      }
    }
  ]
}
