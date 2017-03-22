const { join } = require( "path" ),
      fs = require( "fs" ),
      os = require( "os" ),
      { spawn } = require( "child_process" ),
      { ncp } = require( "ncp" ),
      rimraf = require( "rimraf" );

/**
 * Swap update and original directories
 * @param {string} homeDir
 * @param {string} updateDir
 * @param {string} runner
 * @returns {Promise}
 */
async function swap( homeDir, updateDir, runner ){
  const backup = homeDir + ".old";
  return new Promise(( resolve, reject ) => {
    fs.rmdir( backup, ( err ) => {
      if ( err ) {
        return reject( err );
      }
      fs.rename( homeDir, backup, ( err ) => {
        if ( err ) {
          return reject( err );
        }
        ncp( updateDir, homeDir, ( err ) => {
          if ( err ) {
            return reject( err );
          }
          resolve();
        });
      });
    });
  });
}
/**
 * Launch detached process
 * @param {string} runnerPath
 * @param {string[]} argv
 * @param {string} cwd
 * @returns {Promise}
 */
async function launch( runnerPath, argv, cwd ){
   return new Promise(( resolve, reject ) => {
      const logPath = join( cwd, "swap.log" ),
            err = fs.openSync( logPath, "a" ),
            tpmUserData = join( os.tmpdir(), "nw-autoupdate-user-data" ),


      child = spawn( runnerPath, [ ...argv, `--user-data-dir=${tpmUserData}` ], {
         timeout: 4000,
         detached: true,
         cwd
       });

       child.on( "error", ( e ) => {
         fs.writeSync( err, [ "ERROR:", e, "\r\n" ].join( " " ), "utf-8" );
         reject( err );
       });

       child.on( "exit", resolve );

       child.unref();
   });
}

exports.launch = launch;
exports.swap = swap;