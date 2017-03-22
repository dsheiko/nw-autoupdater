const decompress = require( "decompress" ),
      decompressTargz = require( "decompress-targz" );

/**
 * Extract archive into a given directory
 * @param {string} archiveFile
 * @param {string} extractDest
 * @param {function} onProgress
 */
async function decompressTarGz( archiveFile, extractDest, onProgress ) {
  const options = {
    plugins: [
        decompressTargz()
    ]
  };
  onProgress( 1, 1 );
  await decompress( archiveFile, extractDest, options );
}

module.exports = decompressTarGz;