const Hash = require('hashish');
const { format } = require('util');

// capture terminal output, so that we might assert against it.
exports.checkOutput = function checkOutput(f, argv, cb) {
  let exit = false;
  let exitCode = 0;
  const u_exit = process.exit;
  const u_emit = process.emit;
  const u_emitWarning = process.emitWarning;
  const u_env = process.env;
  const u_argv = process.argv;
  const u_error = console.error;
  const u_log = console.log;
  const u_warn = console.warn;

  process.exit = (code) => {
    exit = true;
    exitCode = code;
  };
  process.env = Hash.merge(process.env, { _: 'node' });
  process.argv = argv || ['./usage'];

  const errors = [];
  const logs = [];
  const warnings = [];
  const emittedWarnings = [];

  console.error = (...msg) => {
    errors.push(format(...msg));
  };
  console.log = (...msg) => {
    logs.push(format(...msg));
  };
  console.warn = (...msg) => {
    warnings.push(format(...msg));
  };
  process.emitWarning = (warning) => {
    emittedWarnings.push(warning);
  };

  let result;

  if (typeof cb === 'function') {
    process.exit = () => {
      exit = true;
      cb(null, done());
    };
    process.emit = function emit(ev, value) {
      if (ev === 'uncaughtException') {
        cb(value, done());
        return true;
      }

      return u_emit.apply(this, arguments);
    };

    f();
  } else {
    try {
      result = f();
      if (typeof result.then === 'function') {
        return result
          .then(() => {
            reset();
            return done();
          })
          .catch(() => {
            reset();
            return done();
          });
      } else {
        reset();
      }
    } catch (_err) {
      reset();
    }
    return done();
  }

  function reset() {
    process.exit = u_exit;
    process.emit = u_emit;
    process.env = u_env;
    process.argv = u_argv;
    process.emitWarning = u_emitWarning;

    console.error = u_error;
    console.log = u_log;
    console.warn = u_warn;
  }

  function done() {
    reset();

    return {
      errors,
      logs,
      warnings,
      emittedWarnings,
      exit,
      exitCode,
      result,
    };
  }
};
