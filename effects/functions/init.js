const actions = require('../actions');
const {isFailure, failure, success} = require('effects-as-data');
const path = require('path');

function* init() {
  const $effectsExists = yield actions.fileExists('effects');
  if ($effectsExists.payload)
    return failure('An effects folder already exists');

  yield actions.copy(
    path.join(__dirname, '../../templates/effects'),
    'effects'
  );

  return success('effects-as-data is initialized');
}

module.exports = {
  init,
};
