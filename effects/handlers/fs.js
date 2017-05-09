const fs = require('fs');
const ncp = require('ncp');
const {safecb} = require('safe-errors');

function fileExists({path}) {
  return fs.existsSync(path);
}

function mkdirSync({path}) {
  return fs.mkdirSync(path);
}

function copy({source, destination}) {
  return safecb(ncp)(source, destination);
}

module.exports = {
  fileExists,
  mkdirSync,
  copy,
};
