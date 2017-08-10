
/**
 * Extract archive into a given directory
 * @param {string} archiveFile
 * @param {string} extractDest
 * @param {function} onProgress
 */
let decompressZip = (() => {
      var _ref = _asyncToGenerator(function* (archiveFile, extractDest, onProgress) {
            const unzipper = new DecompressZip(archiveFile);
            return new Promise(function (resolve, reject) {
                  unzipper.on("error", reject);

                  unzipper.on("extract", resolve);

                  unzipper.on("progress", function (fileIndex, fileCount) {
                        return onProgress(fileIndex + 1, fileCount);
                  });

                  unzipper.extract({
                        path: extractDest
                  });
            });
      });

      return function decompressZip(_x, _x2, _x3) {
            return _ref.apply(this, arguments);
      };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const DecompressZip = require("decompress-zip");

module.exports = decompressZip;
//# sourceMappingURL=unpackZip.js.map