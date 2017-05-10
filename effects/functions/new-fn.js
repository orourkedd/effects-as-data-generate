const c = require('case');
const actions = require('../actions');
const {getSettings} = require('./get-settings');
const {failure, isFailure} = require('effects-as-data');
const path = require('path');
const {replace, pipe} = require('ramda');

function* newFn(fn) {
  const $settings = yield actions.call(getSettings);
  if (isFailure($settings)) return $settings;
  const fileName = c[$settings.payload.filenameCase](fn);
  const nameCamel = c.camel(fn);
  const namePascal = c.pascal(fn);
  const $fnWriteResult = yield actions.call(writeFunction, {
    nameCamel,
    namePascal,
    fileName,
    settings: $settings.payload,
  });
  if (isFailure($fnWriteResult)) return $fnWriteResult;

  const $specWriteResult = yield actions.call(writeSpec, {
    nameCamel,
    namePascal,
    fileName,
    settings: $settings.payload,
  });
  if (isFailure($specWriteResult)) return $specWriteResult;
  return [fileName, nameCamel];
}

function* writeFunction({nameCamel, fileName, settings}) {
  const $functionTemplate = yield actions.readFile(
    path.join(__dirname, '../../templates/fn.js.txt'),
    {encoding: 'utf8'}
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
    {encoding: 'utf8'}
  );
}

function* writeSpec({nameCamel, namePascal, fileName, settings}) {
  const $specTemplate = yield actions.readFile(
    path.join(__dirname, '../../templates/spec.js.txt'),
    {encoding: 'utf8'}
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
    {encoding: 'utf8'}
  );
}

module.exports = {
  newFn,
};
