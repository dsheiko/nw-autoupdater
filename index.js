const EventEmitter = require( "events" ),
      semver = require( "semver" ),
      os = require( "os" ),
      { join, basename, dirname } = require( "path" ),
      unpackTarGz = require( "./Lib/unpackTarGz" ),
      unpackZip = require( "./Lib/unpackZip" ),
      debounce = require( "debounce" ),

      { readJson, download }  = require( "./Lib/request" ),
      { launch, rtrim } = require( "./Lib/utils" ),
      { PLATFORM_FULL, swapFactory,
        getExecutable, UPDATE_DIR, EXEC_DIR, BACKUP_DIR, LOG_DIR } = require( "./Lib/env" ),

      LOG_FILE = "nw-autoupdate.log",
      ERR_INVALID_REMOTE_MANIFEST = "Invalid manifest structure",
      DEBOUNCE_TIME = 500;

class AutoUpdater extends EventEmitter {
  /**
   * Create AutoUpdate
   * @param {Object} manifest
   * @param {Object} options
   */
  constructor( manifest, options = {
      executable: null,
      backupDir: BACKUP_DIR,
      execDir: EXEC_DIR,
      updateDir: UPDATE_DIR,
      logDir: LOG_DIR
    }){

    super();

    this.manifest = manifest;
    if ( !this.manifest.manifestUrl ) {
      throw new Error( `Manifest must contain manifestUrl field` );
    }

    this.release = "";
    this.argv = nw.App.argv;
    this.remoteManifest = "";
    this.options = options;
    this.options.execDir = rtrim( this.options.execDir );
    this.options.executable = this.options.executable || getExecutable( manifest.name );

  }

  /**
   * Read package.json from the release server
   * @returns {Promise<JSON>}
   */
  async readRemoteManifest(){
    return await readJson( this.manifest.manifestUrl );
  }
  /**
   * Check if a new app version available
   * @param {Object} remoteManifest
   * @returns {Promise<boolean>}
   */
  async checkNewVersion( remoteManifest ){
    if ( !remoteManifest || !remoteManifest.packages ){
      throw new TypeError( ERR_INVALID_REMOTE_MANIFEST );
    }
    return semver.gt( remoteManifest.version, this.manifest.version );
  }
  /**
   * Download new version
   * @param {Object} remoteManifest
   * @param {Object} options
   * @returns {Promise<string>}
   */
  async download( remoteManifest, { debounceTime } = { debounceTime: DEBOUNCE_TIME }){
    if ( !remoteManifest || !remoteManifest.packages ){
      throw new TypeError( ERR_INVALID_REMOTE_MANIFEST );
    }
    const release = remoteManifest.packages[ PLATFORM_FULL ];
    if ( !release ) {
      throw new Error( `No release matches the platfrom ${PLATFORM_FULL}` );
    }
    const onProgress = ( length ) => {
      this.emit( "download", length, release.size );
    };
    return await download( release.url, os.tmpdir(), debounce( onProgress, debounceTime ));
  }
  /**
   * Unpack downloaded version
   * @param {string} updateFile
   * @param {Object} options
   * @returns {Promise<string>}
   */
  async unpack( updateFile, { debounceTime } = { debounceTime: DEBOUNCE_TIME } ){
    const isZipRe = /\.zip$/i,
          isGzRe = /\.tar\.gz$/i,
          onProgress = ( installFiles, totalFiles ) => {
            this.emit( "install", installFiles, totalFiles );
          },
          updateDir = this.options.updateDir;

    if ( !updateFile ){
      throw new Error( "You have to call first download method" );
    }

    switch( true ) {
      case isGzRe.test( updateFile ):
         await unpackTarGz( updateFile, updateDir, debounce( onProgress, debounceTime ) );
         break;
      case isZipRe.test( updateFile ):
         await unpackZip( updateFile, updateDir, debounce( onProgress, debounceTime ) );
         break;
      default:
         throw new Error( "Release arhive of unsuported type" );
         break;
    }
    return updateDir;
  }

  /**
   * Restart and launch detached swap
   * @returns {Promise}
   */
  async restartToSwap(){
    const { execDir, updateDir, executable, backupDir, logDir  } = this.options,
          swap = swapFactory(),
          logPath = join( logDir, LOG_FILE ),
          args = swap.getArgs( execDir, updateDir, executable, backupDir, logPath );

    swap.extractScript( updateDir );
    await launch( swap.getRunner(), args, updateDir, logPath );
    nw.App.quit();
  }
}

module.exports = AutoUpdater;
