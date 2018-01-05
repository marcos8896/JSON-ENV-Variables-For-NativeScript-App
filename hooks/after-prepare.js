var path = require("path"); 
var fs = require('fs'); 
var mkdirp = require('mkdirp'); 
 
module.exports = function ( logger, projectData, usbLiveSyncService ) { 
    console.log("------------------------------");
    console.log("------------------------------");
    console.log("on prepare-config");
    console.log("------------------------------");
    console.log("------------------------------");
    var readStream = null; 
    var writeStream = null; 
    var hasError = false; 
 
    function rejectCleanup( err, reject ) { 

      console.log("------------------------------");
      console.log("------------------------------");
      console.log("on rejectCleanup ERROR");
      console.log("------------------------------");
      console.log("------------------------------");

        hasError = true; 
 
        readStream.destroy(); 
        writeStream.end(); 
        logger.error( err ); 
        reject( err ); 
    } 
 
    function createReadStream( buildProfile ) { 
        var fileToRead = path.join(projectData.projectDir, 'config', 'config.' + buildProfile + '.json'); 
 
        readStream = fs.createReadStream( fileToRead ); 
        readStream.on( 'error', rejectCleanup ); 
    } 
 
    function createWriteStream(directoryToWriteTo, resolve) { 
        var fileToWriteTo = path.join( directoryToWriteTo, 'config.json' ); 
 
        writeStream = fs.createWriteStream( fileToWriteTo ); 
        writeStream.on( 'error', rejectCleanup ); 
        writeStream.on( 'finish', function () { 
            if ( !hasError ) {
                console.log("all good on finish.");
                resolve(); 
            } else {
              console.log("There was an error on finish.");
              
            }
        }); 
    } 
 
    return new Promise(function ( resolve, reject ) { 
        // do not copy on live sync 
        if (!!usbLiveSyncService.isInitialized) { 
            resolve(); 
            return; 
        } 
 
        var buildProfile = process.env['BUILD_PROFILE']; 
        var directoryToWriteTo = path.join(projectData.projectDir, 'app', 'config'); 
 
        mkdirp(directoryToWriteTo, function ( err ) { 
            if ( !err ) { 
                createReadStream( buildProfile ); 
                createWriteStream( directoryToWriteTo, resolve ); 
                readStream.pipe( writeStream ); 
            } else { 
                rejectCleanup( err, reject ); 
            } 
        }); 
    }); 
}; 