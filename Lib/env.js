const os = require( "os" );
const { join, dirname } = require( "path" );

const SwapWin = require( "./Swap/Win" );
const SwapLinux = require( "./Swap/Linux" );
const SwapMac = require( "./Swap/Mac" );


const IS_OSX = /^darwin/.test( process.platform );
const IS_WIN = /^win/.test( process.platform );

/**
 * ~/project/project_name
 * EXEC_DIR = ~/project/
 * EXECUTABLE = project_name
 * BACKUP_DIR = ~/project.bak/*.*
 * UPDATE_DIR = /tmp/nw-autoupdate/*.*
 */

const OSX_APP_DIR = IS_OSX ? process.execPath.match( /^([^\0]+?\.app)\// )[ 1 ] : null;

// Directory where the app executable resides
const EXEC_DIR = IS_OSX ?
  dirname( OSX_APP_DIR ) : dirname( process.execPath );

const PKG_NAME = "nw-autoupdater";
const LOG_FILE = `${PKG_NAME}.log`;
const UPDATE_DIR = join( os.tmpdir(), PKG_NAME );
const BACKUP_DIR = IS_OSX ? `${OSX_APP_DIR}.bak` : `${EXEC_DIR}.bak`;
const LOG_PATH = join( nw.App.dataPath, LOG_FILE );

function getExecutable( name )
{
  return ( IS_OSX ? `${name}.app` : name );
}


const PLATFORM_SHORT = ( IS_WIN ? "win" : ( IS_OSX ? "mac" : "linux" ) );
const PLATFORM_FULL = PLATFORM_SHORT + ( process.arch === "ia32" ? "32" : "64" );


function swapFactory( options ){
  const Swap = ( IS_WIN ? SwapWin: ( IS_OSX ? SwapMac : SwapLinux ) );
  return new Swap( options );
}

exports.PLATFORM_SHORT = PLATFORM_SHORT;
exports.PLATFORM_FULL = PLATFORM_FULL;
exports.getExecutable = getExecutable;
exports.EXEC_DIR = EXEC_DIR;
exports.UPDATE_DIR = UPDATE_DIR;
exports.BACKUP_DIR = BACKUP_DIR;
exports.IS_OSX = IS_OSX;
exports.swapFactory = swapFactory;
exports.LOG_PATH = LOG_PATH;
