const {mergeAll} = require('ramda');
const {actions} = require('effects-as-data/node');

function fileExists(path) {
  return {
    type: 'fileExists',
    path,
  };
}

function mkdirSync(path) {
  return {
    type: 'mkdirSync',
    path,
  };
}

function copy(source, destination) {
  return {
    type: 'copy',
    source,
    destination,
  };
}

module.exports = mergeAll([actions, {fileExists, mkdirSync, copy}]);
