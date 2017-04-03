const prompt = require('prompt')
const fs = require('fs')
const { snake, pascal } = require('case')

function fnTemplate (name) {
  return `function * ${name} () {

}

module.exports = {
  ${name}
}
`
}

function specTemplate (name) {
  const fileName = snake(name)
  const nameCapitalized = pascal(name)
  return `const { testIt } = require('effects-as-data/test')
const { ${name} } = require('./${fileName}')

const test${nameCapitalized} = testIt(${name})

describe('${fileName}.js', () => {
  describe('${name}()', () => {
    it('should...', test${nameCapitalized}(() => {
      return [
        []
      ]
    }))
  })
})
`
}

prompt.start()

prompt.get(['Enter the function name'], function (err, result) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  const name = result['Enter the function name']
  const fileName = snake(name)

  if (!name) {
    console.error('A function name is required!')
    process.exit(1)
  }

  if (fs.existsSync(`${fileName}.js`)) {
    console.error(`${fileName}.js already exists.`)
    process.exit(1)
  }
  fs.writeFileSync(`${fileName}.js`, fnTemplate(name))

  if (fs.existsSync(`${fileName}.spec.js`)) {
    console.error(`${fileName}.spec.js already exists.`)
    process.exit(1)
  }
  fs.writeFileSync(`${fileName}.spec.js`, specTemplate(name))
})
