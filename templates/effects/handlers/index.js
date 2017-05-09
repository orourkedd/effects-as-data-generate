const {handlers} = require('effects-as-data/node');
const {mergeAll} = require('ramda');

module.exports = mergeAll([handlers]);
