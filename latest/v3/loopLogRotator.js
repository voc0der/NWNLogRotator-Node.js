// Author: RaveN
// Date: 06/15/2017
// Version 3.0
// Purpose: NodeJS Neverwinter Nights Log rotator, formatter, and trimmer, and now uploader!

var fs = require( 'fs' );
var path = require( 'path' );
var process = require( "process" );
var replace = require('stream-replace');
var through = require('through');
var FileQueue = require('filequeue');
var fq = new FileQueue(100);
  
var source =  "C:/Path/Amia/Logs/";
var destination = "C:/Path/Amia/Logs/HTML";

fs.readdir( source, function( err, files ) {
	if( err ) {
		console.error( "Could not list the directory.", err );
		process.exit( 1 );
	} 

	files.forEach( function( file, index ) {
	
		var sourceFile = path.join( source, file );
		var nakedFile = file.slice(0, -4);
		var destinationFile = path.join( destination, nakedFile ) + ".html";

		fq.stat( sourceFile, function( error, stat ) {
			if( error ) {
				console.error( "Error reading source file.", error );
				return;
			}

			if( stat.isFile() ) {	
				
				var logTitle = "<h4>[<font color='#EEBB33'>Amia Log</font>]" 
						+ "</h4>";
				var preLog = '<html><body bgColor=\'#000000\' style=\'font-family: Tahoma, Geneva, sans-serif;\'><font color=\'#FFFFFF\'>';
				var postLog = '</body></html>';
				
				var filterLogs = new through(function(data){
					var dataFilter = preLog + logTitle + 
					data.toString()
					// core format replacements
					.replace(/\[CHAT WINDOW TEXT\] /g, '')
					.replace(/\[{1}[A-z]{3}\s[A-z]{3}\s[0-9]{2}\s/g, '<font color=\'#B1A2BD\'>[')
					.replace(/:[0-9]{2}]{1}/g, ']</font>')
					// additional patterns
					.replace(/.+?(?=.*).{1}Event.{1} .*\r\n/g, '')
					.replace(/.+?(?=.*)Your public CDKEY is FFUNHEU9\r\n/g, '')
					.replace(/.+?(?=.*)Minimum Tumble AC Bonus: .{1}[0-9]*\r\n/g, '')
					.replace(/.+?(?=.*)You are light sensitive!\r\n/g, '')
					.replace(/.+?(?=.*)has left as a player..\r\n/g, '')
					.replace(/.+?(?=.*)has joined as a player..\r\n/g, '')
					.replace(/.+?(?=.*)You are now in a Party PVP area.\r\n/g, '')
					.replace(/.+?(?=.*)You are now in a No PVP area.\r\n/g, '')
					.replace(/.+?(?=.*)Resting.\r\n/g, '')
					.replace(/.+?(?=.*)Cancelled Rest.\r\n/g, '')
					.replace(/.+?(?=.*)You used a key.\r\n/g, '')
					.replace(/.+?(?=.*)Equipped item swapped out.\r\n/g, '')
					.replace(/.+?(?=.*)You are portalling, you can't do anything right now.\r\n/g, '')
					.replace(/.+?(?=.*)Unknown Speaker: You are being moved to your last location, please wait...\r\n/g, '')
					.replace(/.+?(?=.*)You are entering a new area!\r\n/g, '')
					.replace(/.+?(?=.*)Experience Points Gained: [0-9]*\r\n/g, '')
					.replace(/.+?(?=.*)Armor\/Shield Applies: Skill .*\r\n/g, '')
					.replace(/.+?(?=.*)New Value: [0-9]*\r\n/g, '')
					// actors
					.replace(/\]<\/font>((...).*: )/g, ']</font><font color=\'#8F7FFF\'> $1</font><font color=\'#FFFFFF\'>')
					// tells
					.replace(/ :.*<\/font><font color='.*(\[Tell])/g, '</font><font color=\'#0F0\'> $1:')
					// whispers 
					.replace(/: <\/font><font color='.*(\[Whisper])/g, '</font><font color=\'#808080\'> $1:')
					// emotes 
					.replace(/(\*.*\*)/g, '<font color=\'#ffaed6\'>$1</font>')
					// html formatting
					.replace(/\r\n/g,'<br />');
					dataFilter = dataFilter + postLog;
					logTitle = "";
					// loop -> transform
					this.queue(dataFilter);
				});
				
				var reader = fq.createReadStream(sourceFile);
				var writer = fq.createWriteStream(destinationFile);
				
				/* 
				reader
				.pipe(filterLogs)
				.pipe(process.stdout);
				*/
				
				reader
				.pipe(filterLogs)
				.pipe(writer);
			}		
		});
	});
});