const actions = require('../actions');
const {isFailure, failure, success} = require('effects-as-data');
const path = require('path');

function* init() {
  const effectsPath = path.resolve('effects');
  const $effectsExists = yield actions.fileExists('effects');
  if ($effectsExists.payload)
    return failure(`An effects folder already exists at ${effectsPath}`);

  yield actions.copy(
    path.join(__dirname, '../../templates/effects'),
    'effects'
  );

  return success({
    message: `effects-as-data is initialized.\nPath: ${effectsPath}`,
  });
}

module.exports = {
  init,
};
