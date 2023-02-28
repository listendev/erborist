const fs = require('fs');
const path = require('path');
const Arborist = require('@npmcli/arborist');

exports.command = 'gen [dir]';

exports.desc = 'Generate the lockfile';

exports.builder = (yargs) => yargs
  .option('registry', {
    default: 'https://registry.npmjs.org',
    description: 'The registry URL',
  })
  .option('audit', {
    default: false,
    type: 'boolean',
    description: 'Whether to perform audit or not',
  })
  .option('lockfile-version', {
    default: 3,
    type: 'number',
    choices: [1, 2, 3],
    description: 'The lockfile version to generate',
  })
  .positional('dir', {
    description: 'Where the package.json is',
    type: 'string',
    default: process.cwd,
    defaultDescription: 'CWD',
  })
  .coerce('dir', path.resolve)
  .check((argv) => {
    // Check the path exists
    if (!fs.existsSync(argv.dir)) {
      throw new Error(`The path "${argv.dir}" doesn't exist.`);
    }
    // Check the path is a directory
    const stat = fs.statSync(argv.dir);
    if (!stat.isDirectory()) {
      throw new Error(`The path "${argv.dir}" is not a directory.`);
    }
    // Check the directory contains a package.json file
    if (!fs.existsSync(path.join(argv.dir, 'package.json'))) {
      throw new Error(
        `The directory "${argv.dir}" doesn't contain a package.json file.`,
      );
    }
    return true;
  });

exports.handler = ({
  registry, dir, audit, lockfileVersion,
}) => {
  const arb = new Arborist({
    path: dir,
    audit,
    registry,
    lockfileVersion,
    packageLockOnly: true,
    update: false,
  });

  return arb
    .reify({ save: true })
    .then(() => {
      console.log(`Wrote ${path.join(dir, 'package-lock.json')} 🌱`);
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
};
