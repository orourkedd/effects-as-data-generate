const { run, buildFunctions } = require('effects-as-data');
const handlers = require('./handlers');
const functions = require('./functions');

const fxns = buildFunctions(handlers, functions, { onFailure: () => {} });

module.exports = fxns;
