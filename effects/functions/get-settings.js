const actions = require('../actions');
const path = require('path');
const {identity, merge} = require('ramda');
const {failure, isFailure} = require('effects-as-data');

function* getSettings() {
  const parts = process.cwd().split(path.sep).filter(identity);

  let filePath;
  let folderPath;
  const partsLength = parts.length;
  for (let i = 0; i < partsLength + 1; i++) {
    filePath = path.join.apply(null, ['/'].concat(parts).concat('.eadrc'));
    folderPath = path.join.apply(null, ['/'].concat(parts));
    const $exists = yield actions.fileExists(filePath);
    if ($exists.payload) break;
    parts.pop();
  }

  const $settingsExists = yield actions.fileExists(filePath);
  if (!$settingsExists.payload) return failure('Could not find a .eadrc file');

  const $settingsText = yield actions.readFile(filePath, {encoding: 'utf8'});
  if (isFailure($settingsText)) return $settingsText;
  const $settings = yield actions.jsonParse($settingsText.payload);
  if (isFailure($settings)) return $settings;

  if (!$settings.payload.path)
    return failure(
      '.eadrc does not have a "path".  This should be the path to the effects folder relative to the .eadrc file.'
    );

  const effectsPath = path.join(folderPath, $settings.payload.path);
  const functionsPath = path.join(
    folderPath,
    $settings.payload.path,
    'functions'
  );

  const settings = merge(
    {
      effectsPath,
      functionsPath,
      filenameCase: 'kebab',
    },
    $settings.payload
  );
  return settings;
}

module.exports = {
  getSettings,
};
