const fs = require('fs');
const path = require('path');

exports.chFixtures = (...fixtures) => {
  const origCWD = process.cwd();
  const fixturesDir = path.join('test', 'fixtures', ...fixtures);
  process.chdir(fixturesDir);

  const hook = () => {
    if (fs.existsSync(path.join(origCWD, fixturesDir, 'package-lock.json'))) {
      fs.unlinkSync(path.join(origCWD, fixturesDir, 'package-lock.json'));
    }
  };
  hook();

  return { origin: origCWD, fixtures: fixturesDir, hook };
};
