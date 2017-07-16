const { join  } = require( "path" ),
      fs = require( "fs-extra" ),
      { launch, copy } = require( "../utils" ),
      { swapFactory, IS_OSX } = require( "../env" );


  /**
   * Restart and launch detached swap
   * @returns {Promise}
   */
  async function restartToSwap(extraArgs = []){
    const { execDir, executable, updateDir, backupDir, logPath } = this.options,
          tpmUserData = join( nw.App.dataPath, "swap" ),
          app = join( updateDir, executable ),
          args = [ `--user-data-dir=${tpmUserData}`,
            `--swap=${execDir}`, `--bak-dir=${backupDir}` ].concat( extraArgs );

    if ( IS_OSX ) {
      await launch( "open", [ "-a", app, "--args", ...args ], updateDir, logPath );
    } else {
      await launch( app, args, updateDir, logPath );
    }
    nw.App.quit();
  }

  function getBakDirFromArgv( argv ){
    const raw = argv.find( arg => arg.startsWith( "--bak-dir=" ) );
    if ( !raw ) {
      return false;
    }
    return raw.substr( 10 );
  }

  /**
   * Is it a swap request
   * @returns {Boolean}
   */
  function isSwapRequest(){
    const raw = this.argv.find( arg => arg.startsWith( "--swap=" ) );
    if ( !raw ) {
      return false;
    }

    this.options.execDir = raw.substr( 7 );
    this.options.backupDir = getBakDirFromArgv( this.argv ) || this.options.backupDir;
    return true;
  }
  /**
   * Do swap
   */
  async function swap(){
    const { executable, backupDir, execDir, updateDir, logPath } = this.options,
          log = fs.openSync( logPath, "a" );
    if ( IS_OSX ) {
        await copy( join( execDir, executable ), backupDir, log );
        await copy( updateDir, execDir, log );
    } else {
        await copy( execDir, backupDir, log );
        await copy( updateDir, execDir, log );
    }
  }
  /**
   * REstart after swap
   * @returns {Promise}
   */
  async function restart(extraArgs = []){
    const { execDir, executable, updateDir, logPath } = this.options,
          app = join( execDir, executable );

     if ( IS_OSX ) {
      await launch( "open", [ "-a", app, "--args" ].concat( extraArgs ), execDir, logPath );
    } else {
      await launch( app, [], execDir, logPath );
    }
    nw.App.quit();
  }


exports.restartToSwap = restartToSwap;
exports.restart = restart;
exports.swap = swap;
exports.isSwapRequest = isSwapRequest;
