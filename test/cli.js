const { cli } = require('../index');
const { checkOutput } = require('./helpers/checkOutput');
const { chFixtures } = require('./helpers/chFixtures');
const { rmFile } = require('./helpers/rmFile');
const path = require('path');
const chai = require('chai');
const chaiFiles = require('chai-files');
chai.use(chaiFiles);
chai.should();
const expect = chai.expect;
const file = chaiFiles.file;

describe('CLI', () => {
  describe('erborist', () => {
    it('should be erborist', async () => {
      const r = await checkOutput(() => cli.parse(''));
      r.result.$0.should.equal('erborist');
    });

    it('should show help', async () => {
      const r = await checkOutput(() => cli.parse('--help'));

      r.exit.should.equal(true);
      r.exitCode.should.equal(0);
      r.result.should.have.property('_').with.length(0);
      r.logs
        .join('\n')
        .split(/\n+/)
        .should.deep.equal([
          'erborist <command>',
          'Commands:',
          '  erborist gen [dir]  Generate the lockfile',
          '  erborist version    Print the version',
          'Options:',
          '  -h, --help  Show help                                                                                        [boolean]',
        ]);
    });

    it('should show help when no command', async () => {
      const r = await checkOutput(() => cli.parse(''));

      r.exit.should.equal(true);
      r.exitCode.should.equal(1);
      r.result.should.have.property('_').with.length(0);
      r.errors
        .join('\n')
        .split(/\n+/)
        .should.deep.equal([
          'erborist <command>',
          'Commands:',
          '  erborist gen [dir]  Generate the lockfile',
          '  erborist version    Print the version',
          'Options:',
          '  -h, --help  Show help                                                                                        [boolean]',
          'Not enough non-option arguments: got 0, need at least 1',
        ]);
    });
  });

  describe('version', () => {
    it('should show the version', async () => {
      const r = await checkOutput(() => cli.parse('version'));

      const pkgJSON = require('../package.json');

      r.exit.should.equal(false);
      r.exitCode.should.equal(0);
      r.logs
        .join('\n')
        .split(/\n+/)
        .should.deep.equal([
          pkgJSON.version,
        ]);
    });

    it('should show the version help', async () => {
      const r = await checkOutput(() => cli.parse(['version', '--help']));

      r.exit.should.equal(true);
      r.exitCode.should.equal(0);
      r.logs
        .join('\n')
        .split(/\n+/)
        .should.deep.equal([
          'erborist version',
          'Print the version',
          'Options:',
          '  -h, --help  Show help                                                                                        [boolean]',
        ]);
    });
  });

  describe('gen', () => {
    before('recursively remove all package-lock.json file upon start', () => {
      rmFile(path.join('test', 'fixtures'), 'package-lock.json');
    });

    it('should show the gen help', async () => {
      const r = await checkOutput(() => cli.parse(['gen', '--help']));
      r.exit.should.equal(true);
      r.exitCode.should.equal(0);
      r.logs
        .join('\n')
        .split(/\n+/)
        .should.deep.equal([
          'erborist gen [dir]',
          'Generate the lockfile',
          'Positionals:',
          '  dir  Where the package.json is                                                                 [string] [default: CWD]',
          'Options:',
          '  -h, --help              Show help                                                                            [boolean]',
          '      --registry          The registry URL                                       [default: "https://registry.npmjs.org"]',
          '      --audit             Whether to perform audit or not                                     [boolean] [default: false]',
          '      --lockfile-version  The lockfile version to generate                      [number] [choices: 1, 2, 3] [default: 3]',
        ]);
    });

    it('should set gen default options', async () => {
      const { origin: origCWD, hook: cleanup } = chFixtures('gen');
      const r = await checkOutput(() => cli.parse(['gen']));
      process.chdir(origCWD);

      r.result.then((res) => {
        res.should.have.property('registry', 'https://registry.npmjs.org');
        res.should.have.property('audit', false);
        res.should.have.property('lockfileVersion', 3);
        res.should.have.property('dir', process.cwd());
      });

      cleanup();
    });

    it('should look for package.json into the current working directory and generate package-lock.json for it', async () => {
      const { origin: origCWD, fixtures: fixturesDir, hook: cleanup } = chFixtures('gen');
      const r = await checkOutput(() => cli.parse('gen'));
      process.chdir(origCWD);
      const expectedLockFilePath = path.join(process.cwd(), fixturesDir, 'package-lock.json');

      r.exit.should.equal(false);
      r.exitCode.should.equal(0);
      r.logs
        .join('\n')
        .split(/\n+/)
        .should.deep.equal([
          'Wrote ' + expectedLockFilePath + ' 🌱',
        ]);

      const lockFile = file(expectedLockFilePath);
      // eslint-disable-next-line no-unused-expressions
      expect(lockFile).to.exist;
      expect(lockFile).to.contain('"name": "tier2"');
      expect(lockFile).to.contain('"lockfileVersion": 3');

      cleanup();
    });

    it('should generate lockfile for version 2', async () => {
      const { origin: origCWD, fixtures: fixturesDir, hook: cleanup } = chFixtures('gen');
      const r = await checkOutput(() => cli.parse(['gen', '--lockfile-version', '2']));
      process.chdir(origCWD);
      const expectedLockFilePath = path.join(process.cwd(), fixturesDir, 'package-lock.json');

      r.exit.should.equal(false);
      r.exitCode.should.equal(0);
      r.logs
        .join('\n')
        .split(/\n+/)
        .should.deep.equal([
          'Wrote ' + expectedLockFilePath + ' 🌱',
        ]);

      const lockFile = file(expectedLockFilePath);
      // eslint-disable-next-line no-unused-expressions
      expect(lockFile).to.exist;
      expect(lockFile).to.contain('"name": "tier2"');
      expect(lockFile).to.contain('"lockfileVersion": 2');

      cleanup();
    });

    it('should generate lockfile for version 1', async () => {
      const { origin: origCWD, fixtures: fixturesDir, hook: cleanup } = chFixtures('gen');
      const r = await checkOutput(() => cli.parse(['gen', '--lockfile-version', '1']));
      process.chdir(origCWD);
      const expectedLockFilePath = path.join(process.cwd(), fixturesDir, 'package-lock.json');

      r.exit.should.equal(false);
      r.exitCode.should.equal(0);
      r.logs
        .join('\n')
        .split(/\n+/)
        .should.deep.equal([
          'Wrote ' + expectedLockFilePath + ' 🌱',
        ]);

      const lockFile = file(expectedLockFilePath);
      // eslint-disable-next-line no-unused-expressions
      expect(lockFile).to.exist;
      expect(lockFile).to.contain('"name": "tier2"');
      expect(lockFile).to.contain('"lockfileVersion": 1');

      cleanup();
    });

    it('should error for non-existing path', async () => {
      const notExists = path.join(process.cwd(), 'does', 'not', 'exists');
      const r = await checkOutput(() => cli.parse(['gen', notExists]));

      r.exit.should.equal(true);
      r.exitCode.should.equal(1);
      expect(r.errors.join('\n')).contains('The path "' + notExists + '" doesn\'t exist.');
    });

    it('should error when target path is not a directory', async () => {
      const notDir = path.join(process.cwd(), 'test', 'fixtures', 'gen', 'package.json');
      const r = await checkOutput(() => cli.parse(['gen', notDir]));

      r.exit.should.equal(true);
      r.exitCode.should.equal(1);
      expect(r.errors.join('\n')).contains('The path "' + notDir + '" is not a directory.');
    });

    it('should error when target path does not contain a package.json file', async () => {
      const { origin: origCWD, fixtures: notPackageJSON, hook: cleanup } = chFixtures('empty');
      const r = await checkOutput(() => cli.parse(['gen']));
      process.chdir(origCWD);

      r.exit.should.equal(true);
      r.exitCode.should.equal(1);
      expect(r.errors.join('\n')).contains('The directory "' + path.join(process.cwd(), notPackageJSON) + '" doesn\'t contain a package.json file.');

      cleanup();
    });
  });
});
