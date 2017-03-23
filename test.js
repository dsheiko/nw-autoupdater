const copy = require( "recursive-copy" );

var ncp = require('ncp').ncp;

ncp.limit = 16;

//console.log(".....");
//ncp("/Users/sheiko/Sites/test", "/Users/sheiko/Sites/test-old", function (err) {
// if (err) {
//   return console.error(err);
// }
// console.log('done!');
//});

var fs = require('fs-extra')

fs.copy("/Users/sheiko/Sites/test", "/Users/sheiko/Sites/test-old", function (err) {
  if (err) return console.error(err)
  console.log("success!")
});

//
//copy( "/Users/sheiko/Sites/test", "/Users/sheiko/Sites/test-old", {
//  overwrite: true,
//    expand: true,
//    dot: true,
//    junk: true
//} )
//  .then(() => conlose.log("done"))
//  .then(( err ) => conlose.error( err ));