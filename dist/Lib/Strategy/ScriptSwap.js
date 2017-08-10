

/**
 * Restart and launch detached swap
 * @returns {Promise}
 */
let restartToSwap = (() => {
  var _ref = _asyncToGenerator(function* (extraArgs = []) {
    const { updateDir, logPath } = this.options,
          swap = swapFactory(this.options),
          args = swap.getArgs().concat(extraArgs);

    swap.extractScript(updateDir);
    yield launch(swap.getRunner(), args, updateDir, logPath);
    nw.App.quit();
  });

  return function restartToSwap() {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { join } = require("path"),
      { launch } = require("../utils"),
      { swapFactory } = require("../env");

exports.restartToSwap = restartToSwap;
//# sourceMappingURL=ScriptSwap.js.map