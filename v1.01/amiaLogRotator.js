// Author: RaveN
// Date: 9/24/2016
// Version 1.01
// Purpose: NodeJS Neverwinter Nights Log rotator, formatter, and trimmer.

var fs = require( 'fs' );
var path = require( 'path' );
var process = require( "process" );
var replace = require('stream-replace');
var through = require('through');
var FileQueue = require('filequeue');
var fq = new FileQueue(100);

// Custom Date Time Conversion
var today = new Date();

// Sample Filename: NWNLog_2013_04_23_192504
var monthStr = today.getMonth().toString();
if( monthStr.length == 1) {
	
	monthStr = "0" + monthStr;
}
var dayStr = today.getDate().toString();
if( dayStr.length == 1) {
	
	dayStr = "0" + dayStr;
}
var hourStr = today.getHours().toString();
if( hourStr.length == 1) {
	
	hourStr = "0" + hourStr;

}
var minuteStr = today.getMinutes().toString();
if( minuteStr.length == 1) {
	
	minuteStr = "0" + minuteStr;
}
var secondStr = today.getSeconds().toString();
if( secondStr.length == 1) {
	
	secondStr = "0" + secondStr;
}

var dateString = today.getFullYear() + "_" + monthStr + "_" + dayStr + "_" + hourStr + minuteStr + secondStr;

var fileName = "NWNLog_" + dateString + ".html";
  
var source = "K:/NeverwinterNights/NWN/Logs/nwclientLog1.txt";
var destination = "C:/Users/Selene/Dropbox/Public/Amia/Logs/" + fileName;


fq.stat( source, function( error, stat ) {
	if( error ) {
		console.error( "Error reading source file.", error );
		return;
	}

	if( stat.isFile() ) {	
		
		var logTitle = "<h4>[<font color='#EEBB33'>Amia Log</font>]" 
				+ " <font color='#8F7FFF'>Date</font>: " + monthStr + '/' + dayStr + '/' + today.getFullYear()
				+ " <font color='#8F7FFF'>Start Time:</font> " + hourStr + ":" + minuteStr
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
			.replace(/.+?(?=.*)Experience Points Gained:  200\r\n/g, '')
			.replace(/.+?(?=.*)Armor\/Shield Applies: Skill .*\r\n/g, '')
			.replace(/.+?(?=.*)New Value: [0-9]*\r\n/g, '')
			//.replace(/$1\]<\/font>(...)[A-z]*: /g, '] </font><font color=\'#8F7FFF\'> $1</font><font color=\'#FFFFFF\'>: ')
			// html formatting
			.replace(/\r\n/g,'<br />');
			dataFilter = dataFilter + postLog;
			logTitle = "";
			// loop -> transform
			this.queue(dataFilter);
		});
		
		var reader = fq.createReadStream(source);
		var writer = fq.createWriteStream(destination);
		
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