
/**
 * Remove a directory with content
 * @param {string} dir
 */
let remove = (() => {
  var _ref = _asyncToGenerator(function* (dir) {
    fs.removeSync(dir);
  });

  return function remove(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Copy dir
 * @param {string} from
 * @param {string} to
 * @param {FileDescriptor} log
 * @returns {Promise}
 */


let copy = (() => {
  var _ref2 = _asyncToGenerator(function* (from, to, log) {
    return new Promise(function (resolve, reject) {
      fs.writeSync(log, `copy "${from}" "${to}"\n`, "utf-8");
      fs.copy(from, to, function (err) {
        if (err) {
          fs.writeSync(log, `ERROR: ${err}\n`, "utf-8");
          return reject(err);
        }
        resolve();
      });
    });
  });

  return function copy(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Launch detached process
 * @param {string} runnerPath
 * @param {string[]} argv
 * @param {string} cwd
 * @param {string} logPath
 * @returns {Promise}
 */


let launch = (() => {
  var _ref3 = _asyncToGenerator(function* (runnerPath, argv, cwd, logPath) {
    return new Promise(function (resolve, reject) {
      const log = fs.openSync(logPath, "a"),
            child = spawn(runnerPath, argv, {
        timeout: 4000,
        detached: true,
        cwd
      });

      child.stdout.on("data", function (data) {
        fs.writeSync(log, `${data}`, "utf-8");
      });

      child.stderr.on("data", function (data) {
        fs.writeSync(log, `ERROR: ${data}`, "utf-8");
      });

      child.on("error", function (e) {
        fs.writeSync(log, ["ERROR:", e, "\r\n"].join(" "), "utf-8");
        reject(e);
      });

      child.unref();
      setTimeout(resolve, 500);
    });
  });

  return function launch(_x5, _x6, _x7, _x8) {
    return _ref3.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require("fs-extra"),
      { spawn } = require("child_process");
/**
  * Remove trailing slash
  * @param {string} dir
  * @returns {string}
  */
function rtrim(dir) {
  return dir.replace(/\/$/, "");
}

exports.launch = launch;
exports.rtrim = rtrim;
exports.copy = copy;
exports.remove = remove;
//# sourceMappingURL=utils.js.map