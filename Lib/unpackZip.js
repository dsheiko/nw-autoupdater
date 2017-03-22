const DecompressZip = require( "decompress-zip" );
/**
 * Extract archive into a given directory
 * @param {string} archiveFile
 * @param {string} extractDest
 * @param {function} onProgress
 */
async function decompressZip( archiveFile, extractDest, onProgress ) {
  const unzipper = new DecompressZip( archiveFile );
  return new Promise(( resolve, reject ) => {
      unzipper.on( "error", reject );

      unzipper.on( "extract", resolve );

      unzipper.on( "progress", ( fileIndex, fileCount ) => onProgress( fileIndex + 1, fileCount ) );

      unzipper.extract({
          path: extractDest
      });
  });
}

module.exports = decompressZip;