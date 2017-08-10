function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const EventEmitter = require("events"),
      AppSwapStrategy = require("./Lib/Strategy/AppSwap"),
      ScriptSwapStrategy = require("./Lib/Strategy/ScriptSwap"),
      semver = require("semver"),
      os = require("os"),
      { join, basename, dirname } = require("path"),
      unpackTarGz = require("./Lib/unpackTarGz"),
      unpackZip = require("./Lib/unpackZip"),
      debounce = require("debounce"),
      { readJson, download } = require("./Lib/request"),
      { launch, rtrim, remove } = require("./Lib/utils"),
      { PLATFORM_FULL, swapFactory,
  getExecutable, UPDATE_DIR, EXEC_DIR, BACKUP_DIR, LOG_PATH } = require("./Lib/env"),
      ERR_INVALID_REMOTE_MANIFEST = "Invalid manifest structure",
      DEBOUNCE_TIME = 100,
      DEFAULT_OPTIONS = {
  executable: null,
  backupDir: BACKUP_DIR,
  execDir: EXEC_DIR,
  updateDir: UPDATE_DIR,
  logPath: LOG_PATH,
  verbose: false,
  swapScript: null,
  strategy: "AppSwap",
  accumulativeBackup: false
};

class AutoUpdater extends EventEmitter {
  /**
   * Create AutoUpdate
   * @param {Object} manifest
   * @param {Object} options
   */
  constructor(manifest, options = {}) {

    super();

    this.manifest = manifest;
    if (!this.manifest.manifestUrl) {
      throw new Error(`Manifest must contain manifestUrl field`);
    }

    this.release = "";
    this.argv = nw.App.argv;
    this.remoteManifest = "";
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.options.backupDir += this.options.accumulativeBackup ? `_${Math.floor(Date.now() / 1000)}` : ``;
    this.options.execDir = rtrim(this.options.execDir);
    this.options.executable = this.options.executable || getExecutable(manifest.name);
    // Mixing up a chosen strategy
    Object.assign(this, this.options.strategy === "ScriptSwap" ? ScriptSwapStrategy : AppSwapStrategy);
  }
  /**
   * Read package.json from the release server
   * @returns {Promise<JSON>}
   */
  readRemoteManifest() {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        return yield readJson(_this.manifest.manifestUrl);
      } catch (e) {
        throw new Error(`Cannot read remote manifest from ${_this.manifest.manifestUrl}`);
      }
    })();
  }
  /**
   * Check if a new app version available
   * @param {Object} remoteManifest
   * @returns {Promise<boolean>}
   */
  checkNewVersion(remoteManifest) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (!remoteManifest || !remoteManifest.packages) {
        throw new TypeError(ERR_INVALID_REMOTE_MANIFEST);
      }
      return semver.gt(remoteManifest.version, _this2.manifest.version);
    })();
  }
  /**
   * Download new version
   * @param {Object} remoteManifest
   * @param {Object} options
   * @returns {Promise<string>}
   */
  download(remoteManifest, { debounceTime } = { debounceTime: DEBOUNCE_TIME }) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      if (!remoteManifest || !remoteManifest.packages) {
        throw new TypeError(ERR_INVALID_REMOTE_MANIFEST);
      }
      const release = remoteManifest.packages[PLATFORM_FULL];
      if (!release) {
        throw new Error(`No release matches the platfrom ${PLATFORM_FULL}`);
      }
      const onProgress = function (length) {
        _this3.emit("download", length, release.size);
      };
      try {
        remove(_this3.options.updateDir);
        return yield download(release.url, os.tmpdir(), debounce(onProgress, debounceTime));
      } catch (e) {
        throw new Error(`Cannot download package from ${release.url}`);
      }
    })();
  }
  /**
   * Unpack downloaded version
   * @param {string} updateFile
   * @param {Object} options
   * @returns {Promise<string>}
   */
  unpack(updateFile, { debounceTime } = { debounceTime: DEBOUNCE_TIME }) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const isZipRe = /\.zip$/i,
            isGzRe = /\.tar\.gz$/i,
            onProgress = function (installFiles, totalFiles) {
        _this4.emit("install", installFiles, totalFiles);
      },
            updateDir = _this4.options.updateDir;

      if (!updateFile) {
        throw new Error("You have to call first download method");
      }

      switch (true) {
        case isGzRe.test(updateFile):
          try {
            yield unpackTarGz(updateFile, updateDir, debounce(onProgress, debounceTime));
          } catch (e) {
            throw new Error(`Cannot unpack .tar.gz package ${updateFile}`);
          }
          break;
        case isZipRe.test(updateFile):
          try {
            yield unpackZip(updateFile, updateDir, debounce(onProgress, debounceTime));
          } catch (e) {
            throw new Error(`Cannot unpack .zip package ${updateFile}: ${e.message}`);
          }
          break;
        default:
          throw new Error("Release arhive of unsuported type");
          break;
      }
      return updateDir;
    })();
  }

  /**
   * @deprecated since v.1.1.0
   * @returns {Boolean}
   */
  isSwapRequest() {
    return false;
  }
  /**
   * @deprecated since v.1.1.0
   * @returns {Boolean}
   */
  swap() {
    return _asyncToGenerator(function* () {
      return false;
    })();
  }
  /**
   * @deprecated since v.1.1.0
   * @returns {Boolean}
   */
  restart() {
    return _asyncToGenerator(function* () {
      return false;
    })();
  }
}

module.exports = AutoUpdater;
//# sourceMappingURL=index.js.map