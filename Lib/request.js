const http = require( "http" ),
      https = require( "https" ),
      url = require( "url" ),
      fs = require( "fs" ),
      { join } = require( "path" );

/**
 * Extract file name from a download URI
 * @param {string} uri
 * @returns {string}
 */
function getFilename( uri ){
  const [ filename ] = url.parse( uri ).pathname.split( `/` ).reverse();
  return filename;
}

/**
 * Make HTTP request
 * @private
 * @param {string} uri
 * @returns {Promise}
 */
function request( uri ){
  const driver = url.parse( uri ).protocol === "https:" ? https : http;
  return new Promise(( resolve, reject ) => {
   return driver.get( uri, ( res ) => {
      const statusCode = res.statusCode;
      let error = false;
      if ( statusCode !== 200 ) {
        error = new Error( `Request Failed (${uri}).\n` +
                           `Status Code: ${statusCode}` );
      }

      if ( error ) {
        // consume response data to free up memory
        res.resume();
        return reject( error );
      }
      return resolve( res );
    }).on( "error", ( e ) => {
      reject( new Error( `Cannot read (${uri}).\n${e.message}` ) );
    });
   });
}

/**
 * Read JSON from a remote host
 * @param {string} uri
 * @returns {Promise}
 */
async function readJson( uri ){
  const res = await request( uri );
  return new Promise(( resolve, reject ) => {
    contentType = res.headers[ "content-type" ];
    let rawData = "";
    if ( !/^application\/json/.test( contentType ) ) {
      return reject( new Error( `Invalid content-type (${uri}).\n` +
                         `Expected application/json but received ${contentType}`) );
    }
    res.setEncoding( "utf8" );
    res.on( "data", chunk => {
      // downloaded / total
      return rawData += chunk;
    });
    res.on( "end", () => {
      try {
        resolve( JSON.parse( rawData ) );
      } catch ( e ) {
        reject( e );
      }
    });
  });
}

/**
 * Download file
 * @param {string} srcUri
 * @param {string} targetDir
 * @param {function} onProgress
 * @returns {Promise}
 */
async function download( srcUri, targetDir, onProgress ){
  const res = await request( srcUri ),
        filename = getFilename( srcUri ),
        filepath = join( targetDir, filename );
  return new Promise(( resolve, reject ) => {
    let length = 0;
    res.on( "data", chunk => {
      length += chunk.length;
      onProgress( length );
    });
    res.pipe( fs.createWriteStream( filepath ) );
    res.on( "end", () => {
      onProgress( length );
      resolve( filepath );
    });
  });
}

exports.readJson = readJson;
exports.download = download;