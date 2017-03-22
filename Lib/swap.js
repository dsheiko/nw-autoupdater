const { join, dirname } = require( "path" ),
      fs = require( "fs" ),
      os = require( "os" ),
      { spawn } = require( "child_process" ),
      copy = require('recursive-copy'),
      LOG_PATH = join( nw.App.dataPath, "swap.log" );


async function rm( dir ) {
  return new Promise(( resolve ) => {
    rimraf( dir, ( err ) => {
      resolve( err ? false : true );
    });
  });
}

async function mv( from, to, log ) {
  return new Promise(( resolve ) => {
    fs.rename( from, to, ( e ) => {
      if ( e ) {
        fs.writeSync( log, [ "ERROR:", e, "\r\n" ].join( " " ), "utf-8" );
        return reject( e );
      }
      resolve();
    });
  });
}

async function cp( from, to, log ) {
   return new Promise(( resolve ) => {
    ncp( from, to, ( e ) => {
      if ( e ) {
        fs.writeSync( log, [ "ERROR:", e, "\r\n" ].join( " " ), "utf-8" );
        return reject( e );
      }
      resolve();
    });
  });
}

/**
 * Swap update and original directories
 * @param {string} origHomeDir
 * @param {string} selfDir
 * @param {string} runner
 * @returns {Promise}
 */
async function swap( origHomeDir, selfDir, runner ){
  const backup = origHomeDir + ".old",
        err = fs.openSync( LOG_PATH, "a" );

  await copy( origHomeDir, backup, { overwrite: true } );
  await copy( selfDir, origHomeDir, { overwrite: true } );
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
      const err = fs.openSync( LOG_PATH, "a" ),
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