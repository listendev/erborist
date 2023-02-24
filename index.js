#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv))
  .scriptName("erborist")
  .wrap(120)
  .command(require("./cmd/gen"))
  .command(require("./cmd/version"))
  .demandCommand()
  .option("registry", {
    default: "https://registry.npmjs.org",
    description: "The registry URL",
  })
  .help(true)
  .alias("h", "help")
  .alias("v", "version")
  .showHelpOnFail(true)
  .version(false)
  .parse();
