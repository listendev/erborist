const pkgJSON = require('../../package.json');

exports.command = 'version';

exports.desc = 'Print the version';

exports.handler = () => {
  console.log(pkgJSON.version);
};
