const fs = require( "fs" ),
      express = require( "express" ),
      c = require( "chalk" ),
      app = express(),
      { getVersion, updateManifest } = require( "./Lib/utils" ),
      HOST = "http://localhost:8080/releases/",
      cache = new Set();

/**
 * Watches releases folder. As a new release arrives, server updates the manifest
 */
fs.watch( "releases", { encoding: "utf8" }, ( eventType, filename ) => {
  const re = /\.zip$/i;
  if ( !filename || cache.has( filename ) || !re.test( filename ) ) {
    return;
  }
  cache.add( filename );
  const version = getVersion( filename );
  if ( !version ){
    return;
  }
  updateManifest( HOST, version );
});


app.use(function (req, res, next) {
  console.log( c.cyan( `${req.method} ${req.url}` ) );
  next();
});

app.use( express.static( "releases" ) );
app.use( express.static( "." ) );

app.listen( 8080, () => {
  console.log( `${c.yellow("Starting up release-server. Available on:")} ${c.green("http://127.0.0.1:8080")}` );
});