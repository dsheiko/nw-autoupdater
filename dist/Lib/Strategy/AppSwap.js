

/**
 * Restart and launch detached swap
 * @returns {Promise}
 */
let restartToSwap = (() => {
  var _ref = _asyncToGenerator(function* (extraArgs = []) {
    const { execDir, executable, updateDir, backupDir, logPath } = this.options,
          tpmUserData = join(nw.App.dataPath, "swap"),
          app = join(updateDir, executable),
          args = [`--user-data-dir=${tpmUserData}`, `--swap=${execDir}`, `--bak-dir=${backupDir}`].concat(extraArgs);

    if (IS_OSX) {
      yield launch("open", ["-a", app, "--args", ...args], updateDir, logPath);
    } else {
      yield launch(app, args, updateDir, logPath);
    }
    nw.App.quit();
  });

  return function restartToSwap() {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Do swap
 */
let swap = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    const { executable, backupDir, execDir, updateDir, logPath } = this.options,
          log = fs.openSync(logPath, "a");
    if (IS_OSX) {
      yield copy(join(execDir, executable), backupDir, log);
      yield copy(updateDir, execDir, log);
    } else {
      yield copy(execDir, backupDir, log);
      yield copy(updateDir, execDir, log);
    }
  });

  return function swap() {
    return _ref2.apply(this, arguments);
  };
})();
/**
 * REstart after swap
 * @returns {Promise}
 */


let restart = (() => {
  var _ref3 = _asyncToGenerator(function* (extraArgs = []) {
    const { execDir, executable, updateDir, logPath } = this.options,
          app = join(execDir, executable);

    if (IS_OSX) {
      yield launch("open", ["-a", app, "--args"].concat(extraArgs), execDir, logPath);
    } else {
      yield launch(app, [], execDir, logPath);
    }
    nw.App.quit();
  });

  return function restart() {
    return _ref3.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { join } = require("path"),
      fs = require("fs-extra"),
      { launch, copy } = require("../utils"),
      { swapFactory, IS_OSX } = require("../env");

function getBakDirFromArgv(argv) {
  const raw = argv.find(arg => arg.startsWith("--bak-dir="));
  if (!raw) {
    return false;
  }
  return raw.substr(10);
}

/**
 * Is it a swap request
 * @returns {Boolean}
 */
function isSwapRequest() {
  const raw = this.argv.find(arg => arg.startsWith("--swap="));
  if (!raw) {
    return false;
  }

  this.options.execDir = raw.substr(7);
  this.options.backupDir = getBakDirFromArgv(this.argv) || this.options.backupDir;
  return true;
}

exports.restartToSwap = restartToSwap;
exports.restart = restart;
exports.swap = swap;
exports.isSwapRequest = isSwapRequest;
//# sourceMappingURL=AppSwap.js.map