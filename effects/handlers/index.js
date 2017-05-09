const {handlers} = require('effects-as-data/node');
const {mergeAll} = require('ramda');
const fs = require('./fs');

module.exports = mergeAll([handlers, fs]);
