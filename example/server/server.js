const fs = require( "fs" ),
      express = require( "express" ),
      app = express(),
      { getVersion, updateManifest } = require( "./Lib/utils" ),
      HOST = "http://localhost:8080/releases/";

/**
 * Watches releases folder. As a new release arrives, server updates the manifest
 */
fs.watch( "releases", { encoding: "utf8" }, ( eventType, filename ) => {
  const re = /\.zip$/i;
  if ( !filename || !re.test( filename ) ) {
    return;
  }
  const version = getVersion( filename );
  if ( !version ){
    return;
  }
  updateManifest( HOST, version );
});

app.use( express.static( "public" ) );

app.listen( 8080, () => {
  console.log( "Starting up release-server. Available on http://127.0.0.1:8080" );
});