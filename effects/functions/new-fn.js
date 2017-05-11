const c = require('case');
const actions = require('../actions');
const { getSettings } = require('./get-settings');
const { failure, isFailure, success } = require('effects-as-data');
const path = require('path');
const { replace, pipe, merge, toPairs, map, values } = require('ramda');

function* newFn(fn) {
  if (!fn) return failure('A function name is required.');
  const $settings = yield actions.call(getSettings);
  if (isFailure($settings)) return $settings;
  const fileName = c[$settings.payload.filenameCase](fn);
  const nameCamel = c.camel(fn);
  const namePascal = c.pascal(fn);
  const $fnWriteResult = yield actions.call(writeFunction, {
    nameCamel,
    namePascal,
    fileName,
    settings: $settings.payload
  });
  if (isFailure($fnWriteResult)) return $fnWriteResult;

  const $specWriteResult = yield actions.call(writeSpec, {
    nameCamel,
    namePascal,
    fileName,
    settings: $settings.payload
  });
  if (isFailure($specWriteResult)) return $specWriteResult;

  const $writeIndexResult = yield actions.call(writeIndex, {
    fn,
    fileName,
    settings: $settings.payload
  });
  if (isFailure($writeIndexResult)) return $writeIndexResult;

  return success({
    message: `${fn}() has been created.\nPath: ${$settings.payload.functionsPath}/${fileName}.js`
  });
}

function* writeFunction({ nameCamel, fileName, settings }) {
  const $functionTemplate = yield actions.readFile(
    path.join(__dirname, '../../templates/fn.js.txt'),
    { encoding: 'utf8' }
  );
  if (isFailure($functionTemplate)) return $functionTemplate;
  const functionText = replace(
    /{{{name}}}/g,
    nameCamel,
    $functionTemplate.payload
  );
  return yield actions.writeFile(
    path.join(settings.functionsPath, fileName + '.js'),
    functionText,
    { encoding: 'utf8' }
  );
}

function* writeSpec({ nameCamel, namePascal, fileName, settings }) {
  const $specTemplate = yield actions.readFile(
    path.join(__dirname, '../../templates/spec.js.txt'),
    { encoding: 'utf8' }
  );
  if (isFailure($specTemplate)) return $specTemplate;
  const specText = pipe(
    replace(/{{{name}}}/g, nameCamel),
    replace(/{{{nameCapitalized}}}/g, namePascal),
    replace(/{{{fileName}}}/g, fileName)
  )($specTemplate.payload);
  return yield actions.writeFile(
    path.join(settings.functionsPath, fileName + '.spec.js'),
    specText,
    { encoding: 'utf8' }
  );
}

function* writeIndex({ fileName, fn, settings }) {
  const indexPath = path.join(settings.functionsPath, '.eadindex');
  const $index = yield actions.readFile(indexPath, { encoding: 'utf8' });
  if (isFailure($index)) return $index;
  const $functionsIndex = yield actions.jsonParse($index.payload);
  if (isFailure($functionsIndex)) return $functionsIndex;
  const updatedFunctionsIndex = merge($functionsIndex.payload, {
    [fileName]: fn
  });
  const indexString = JSON.stringify(updatedFunctionsIndex);
  const $writeResult = yield actions.writeFile(indexPath, indexString, {
    encoding: 'utf8'
  });
  if (isFailure($writeResult)) return $writeResult;
  return yield actions.call(writeFnIndex, {
    functionsPath: settings.functionsPath,
    functionsIndex: updatedFunctionsIndex
  });
}

function* writeFnIndex({ functionsIndex, functionsPath }) {
  const pairs = toPairs(functionsIndex);
  const requires = map(
    ([file, fn]) => `const { ${fn} } = require('./${file}.js')`,
    pairs
  );

  const functionsList = values(functionsIndex);
  const exportsStatement = `module.exports = { ${functionsList.join(', ')} }`;
  const fileText = `${requires.join('\n')}\n\n${exportsStatement}`;
  const $writeResult = yield actions.writeFile(
    path.join(functionsPath, 'index.js'),
    fileText,
    {
      encoding: 'utf8'
    }
  );
  return $writeResult;
}

module.exports = {
  newFn
};
