const EventEmitter = require( "events" ),
      semver = require( "semver" ),
      os = require( "os" ),
      { join, basename, dirname } = require( "path" ),
      unpackTarGz = require( "./Lib/unpackTarGz" ),
      unpackZip = require( "./Lib/unpackZip" ),
      debounce = require( "debounce" ),
      { readJson, download }  = require( "./Lib/request" ),
      { launch, swap } = require( "./Lib/swap" ),
      ERR_INVALID_REMOTE_MANIFEST = "Invalid manifest structure",
      DEBOUNCE_TIME = 500,
      IS_OSX = /^darwin/.test( process.platform ),
      IS_WIN = /^win/.test( process.platform ),
      HOME_DIR = dirname( process.execPath );

class AutoUpdater extends EventEmitter {
  /**
   * Create AutoUpdate
   * @param {Object} manifest
   * @param {Object} executable
   */
  constructor( manifest, { executable } = { executable: null } ){
    super();
    this.manifest = manifest;
    if ( !this.manifest.manifestUrl ) {
      throw new Error( `Manifest must contain manifestUrl field` );
    }
    this.updatePath = join( os.tmpdir(), "nw-autoupdate" );
    this.release = "";
    this.argv = nw.App.argv;
    this.remoteManifest = "";
    this.platform = AutoUpdater.getPlatform();
    this.runner = executable || ( IS_OSX ? `open -a ${manifest.name}` : manifest.name );
  }
  /**
   * Extract platform info from process
   * @returns {string}
   */
  static getPlatform(){
    const raw = process.platform,
          platform = IS_WIN ? "win" :
            ( IS_OSX ? "mac" : "linux" );
    return platform + ( process.arch === "ia32" ? "32" : "64" );
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
    const release = remoteManifest.packages[ this.platform ];
    if ( !release ) {
      throw new Error( `No release matches the platfrom ${this.platform}` );
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
          };

    if ( !updateFile ){
      throw new Error( "You have to call first download method" );
    }

    switch( true ) {
      case isGzRe.test( updateFile ):
         await unpackTarGz( updateFile, this.updatePath, debounce( onProgress, debounceTime ) );
         break;
      case isZipRe.test( updateFile ):
         await unpackZip( updateFile, this.updatePath, debounce( onProgress, debounceTime ) );
         break;
      default:
         throw new Error( "Release arhive of unsuported type" );
         break;
    }
    return this.updatePath;
  }
  /**
   * Restart and launch detached swap
   * @returns {Promise}
   */
  async restartToSwap(){
    const program = join( this.updatePath, this.runner );
    if ( IS_OSX ) {
      await launch( "open", [ "-a", program, ...nw.App.argv, `--swap=${HOME_DIR}` ], HOME_DIR );
    } else {
      await launch( program, [ ...nw.App.argv, `--swap=${HOME_DIR}` ], HOME_DIR );
    }
    nw.App.quit();
  }
  /**
   * Is it a swap request
   * @returns {Boolean}
   */
  isSwapRequest(){
    const raw = this.argv.find( arg => arg.startsWith( "--swap=" ) );
    if ( !raw ) {
      return false;
    }
    this.homeDir = raw.substr( 7 );
    return true;
  }
  /**
   * Do swap
   */
  async swap(){
    return await swap( this.homeDir, HOME_DIR, this.runner );
  }
  /**
   * REstart after swap
   * @returns {Promise}
   */
  async restart(){
    const argv = nw.App.argv.filter( arg => !arg.startsWith( "--swap=" ) && !arg.startsWith( "--user-data-dir=" ) ),
          program = join( this.homeDir, this.runner );
    if ( IS_OSX ) {
      await launch( "open", [ "-a", program, ...nw.App.argv ], this.homeDir );
    } else {
      await launch( program, nw.App.argv, this.homeDir );
    }
    nw.App.quit();
  }
}

module.exports = AutoUpdater;