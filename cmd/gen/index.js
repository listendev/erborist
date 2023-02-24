const fs = require("fs");
const path = require("path");

exports.command = "gen [dir]";

exports.desc = "Generate the lockfile";

exports.builder = (yargs) => {
  return yargs
    .positional("dir", {
      description: "The directory where the package.json is",
      type: "string",
      default: process.cwd,
      defaultDescription: "CWD",
    })
    .coerce("dir", path.resolve)
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
      if (!fs.existsSync(path.join(argv.dir, "package.json"))) {
        throw new Error(
          `The directory "${argv.dir} doesn't contain a package.json file.`
        );
      }
      return true;
    });
};

exports.handler = ({ registry, dir: path }) => {
  console.log("GEN", path);
};
