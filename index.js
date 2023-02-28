#!/usr/bin/env node

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const cli = yargs(hideBin(process.argv))
  .scriptName('erborist')
  .wrap(120)
  .command(require('./cmd/gen'))
  .command(require('./cmd/version'))
  .demandCommand()
  .help(true)
  .alias('h', 'help')
  .alias('v', 'version')
  .showHelpOnFail(true)
  .version(false);

cli.parse();

exports.cli = cli;
