// Author: RaveN
// Date: 9/18/2016
// Purpose: NodeJS Neverwinter Nights Log rotator and trimmer.

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
var dayStr = today.getDate();
if( dayStr.length == 1) {
	
	dayStr = "0" + dayStr;
}
var hourStr = today.getHours();
if( hourStr.length == 1) {
	
	hourStr = "0" + hourStr;
}
var minuteStr = today.getMinutes();
if( minuteStr.length == 1) {
	
	minuteStr = "0" + minuteStr;
}
var secondStr = today.getSeconds();
if( secondStr.length == 1) {
	
	secondStr = "0" + secondStr;
}

var dateString = today.getFullYear() + "_" + monthStr + "_" + dayStr + "_" + hourStr + minuteStr + secondStr;

var fileName = "NWNLog_" + dateString + ".txt";
  
var source = "K:/NeverwinterNights/NWN/Logs/nwclientLog1.txt";
var destination = "C:/Users/Selene/Dropbox/Public/Sinfar/Logs/" + fileName;


fq.stat( source, function( error, stat ) {
	if( error ) {
		console.error( "Error reading source file.", error );
		return;
	}

	if( stat.isFile() ) {
		
		var filterLogs = new through(function(data){
			var dataFilter = data.toString().replace(/\[CHAT WINDOW TEXT\] /g, '')
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
			.replace(/.+?(?=.*)New Value: [0-9]*\r\n/g, '');
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