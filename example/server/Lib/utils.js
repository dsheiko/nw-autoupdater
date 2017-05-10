const fs = require( "fs" ),
      { join } = require( "path" ),
      c = require( "chalk" ),
      HOST = "http://localhost:8080/releases/",
      MANIFEST_FILE = join( __dirname, "/../", "/package.json" ),
      RELEASES = join( __dirname, "/../", "/releases" ),
      manifest = require( MANIFEST_FILE ),
      platforms = [
        [ `linux-x64.`, `linux64` ],
        [ `linux-x32.`, `linux32` ],
        [ `osx-x64.`, `mac64` ],
        [ `osx-x32.`, `mac32` ],
        [ `win-ia32.`, `win32` ],
        [ `win-x64.`, `win64` ]
      ];


/**
 * Parse vemver from filename
 * @param {string} filename
 * @returns {string}
 */
function getVersion( filename ){
  const re = /-r(\d+\.\d+\.\d+)-/;
  const match = filename.match( re );
  return match ? match[ 1 ] : null;
}
/**
 * Determine platfrom from filename
 * @param {string} file
 * @returns {string}
 */
function getPlatform( file ){
  const match = platforms.find( pair => file.indexOf( pair[ 0 ] ) !== -1 );
  return match ? match[ 1 ] : null;
}
/**
 * Update manifest fields packages and version
 * @param {string} host
 * @param {string} [version]
 */
function updateManifest( host, version = null ){
  fs.readdir( RELEASES, ( err, files ) => {
    if ( err ) {
      return console.error( err );
    }
    manifest.packages = {};
    files.forEach( file => {
      const platform =  getPlatform( file );
      if ( !platform ) {
        return;
      }
      manifest.packages[ platform ] = {
        url: host + file,
        size: fs.statSync( join( RELEASES, file ) ).size
      };
    });

    if ( version ) {
      manifest.version = version;
    }

    fs.writeFile( MANIFEST_FILE, JSON.stringify( manifest, null, 2 ), "utf8", ( err ) => {
      if ( err ) {
        return console.error( err );
      }
      console.log( "package.json updated"
        + ( version ? ` to version ${c.cyan( version )}` : "" ) );
    });

  });
}

exports.updateManifest = updateManifest;
exports.getVersion = getVersion;