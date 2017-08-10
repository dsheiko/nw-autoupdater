

/**
 * Read JSON from a remote host
 * @param {string} uri
 * @returns {Promise}
 */
let readJson = (() => {
  var _ref = _asyncToGenerator(function* (uri) {
    const res = yield request(uri);
    return new Promise(function (resolve, reject) {
      contentType = res.headers["content-type"];
      let rawData = "";
      if (!/^application\/json/.test(contentType)) {
        return reject(new Error(`Invalid content-type (${uri}).\n` + `Expected application/json but received ${contentType}`));
      }
      res.setEncoding("utf8");
      res.on("data", function (chunk) {
        // downloaded / total
        return rawData += chunk;
      });
      res.on("end", function () {
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  return function readJson(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Download file
 * @param {string} srcUri
 * @param {string} targetDir
 * @param {function} onProgress
 * @returns {Promise}
 */


let download = (() => {
  var _ref2 = _asyncToGenerator(function* (srcUri, targetDir, onProgress) {
    const res = yield request(srcUri),
          filename = getFilename(srcUri),
          filepath = join(targetDir, filename);
    return new Promise(function (resolve, reject) {
      let length = 0;
      res.on("data", function (chunk) {
        length += chunk.length;
        onProgress(length);
      });
      res.pipe(fs.createWriteStream(filepath));
      res.on("end", function () {
        onProgress(length);
        resolve(filepath);
      });
    });
  });

  return function download(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const http = require("http"),
      https = require("https"),
      url = require("url"),
      fs = require("fs"),
      { join } = require("path");

/**
 * Extract file name from a download URI
 * @param {string} uri
 * @returns {string}
 */
function getFilename(uri) {
  const [filename] = url.parse(uri).pathname.split(`/`).reverse();
  return filename;
}

/**
 * Make HTTP request
 * @private
 * @param {string} uri
 * @returns {Promise}
 */
function request(uri) {
  const driver = url.parse(uri).protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    return driver.get(uri, res => {
      const statusCode = res.statusCode;
      let error = false;
      if (statusCode !== 200) {
        error = new Error(`Request Failed (${uri}).\n` + `Status Code: ${statusCode}`);
      }

      if (error) {
        // consume response data to free up memory
        res.resume();
        return reject(error);
      }
      return resolve(res);
    }).on("error", e => {
      reject(new Error(`Cannot read (${uri}).\n${e.message}`));
    });
  });
}

exports.readJson = readJson;
exports.download = download;
//# sourceMappingURL=request.js.map