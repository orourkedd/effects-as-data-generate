const program = require('commander');
const fxns = require('./effects');
const chalk = require('chalk');
const { failure, isFailure } = require('effects-as-data');

program.version('0.0.1').command('init').action(function() {
  fxns.init().then(printResult).catch(printFailure);
});

program.version('0.0.1').command('fn').action(function(fn) {
  const fnName = typeof fn === 'string' ? fn : null;
  fxns.newFn(fnName).then(printResult).catch(printFailure);
});

function printResult(result) {
  if (isFailure(result)) printFailure(result);
  else printSuccess(result);
}

function printSuccess(result) {
  console.error(chalk.green(result.payload.message));
}

function printFailure(result) {
  const f = failure(result);
  console.error(chalk.red(f.error.message));
  if (f.error.stack) {
    console.error(f.error.stack);
  }
}

program.parse(process.argv);
