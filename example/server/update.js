const fs = require( "fs" ),
      { join } = require( "path" ),
      HOST = "http://localhost:8080/releases/",
      MANIFEST_FILE = "./package.json",
      RELEASES = join( ".", "releases" ),
      manifest = require( MANIFEST_FILE ),
      platforms = [
        [ `linux-x64.`, `linux64` ],
        [ `linux-x32.`, `linux32` ],
        [ `osx-x64.`, `mac64` ],
        [ `osx-x32.`, `mac32` ],
        [ `win-ia32.`, `win32` ],
        [ `win-x64.`, `win64` ]
      ];

function getPlatform( file ){
  const match = platforms.find( pair => file.indexOf( pair[ 0 ] ) !== -1 );
  return match ? match[ 1 ] : null;
}

fs.readdir( RELEASES, ( err, files ) => {
  if ( err ) {
    return console.error( err );
  }
  manifest .packages = {};
  files.forEach( file => {
    const platform =  getPlatform( file );
    manifest.packages[ platform ] = {
      url: HOST + file,
      size: fs.statSync( join( RELEASES, file ) ).size
    };
  });

  fs.writeFile( MANIFEST_FILE, JSON.stringify( manifest, null, 2 ), "utf8", ( err ) => {
    if ( err ) {
      return console.error( err );
    }
    console.log( MANIFEST_FILE + " updated." );
  });

});