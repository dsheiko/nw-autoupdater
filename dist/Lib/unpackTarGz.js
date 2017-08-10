

/**
 * Extract archive into a given directory
 * @param {string} archiveFile
 * @param {string} extractDest
 * @param {function} onProgress
 */
let decompressTarGz = (() => {
  var _ref = _asyncToGenerator(function* (archiveFile, extractDest, onProgress) {
    const options = {
      plugins: [decompressTargz()]
    };
    onProgress(1, 1);
    yield decompress(archiveFile, extractDest, options);
  });

  return function decompressTarGz(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const decompress = require("decompress"),
      decompressTargz = require("decompress-targz");

module.exports = decompressTarGz;
//# sourceMappingURL=unpackTarGz.js.map