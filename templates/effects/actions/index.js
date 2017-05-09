const {mergeAll} = require('ramda');
const {actions} = require('effects-as-data/node');

module.exports = mergeAll([actions]);
