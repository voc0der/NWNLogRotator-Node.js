// Author: RaveN
// Date: 06/18/2017
// Version 1.0
// Purpose: NodeJS Neverwinter Nights Log rotator, formatter, and trimmer, and now uploader!

// [ BASE VARIABLES ]
var sftp_hostname = "";
var sftp_port = "";
var sftp_username = "";
var sftp_password = "";
var sftp_log_dir = "";
var output_base_dir = "C:/Program Files (x86)/GOG.com/Neverwinter Nights Diamond Edition/Logs";
var source = "C:/Program Files (x86)/GOG.com/Neverwinter Nights Diamond Edition/Logs/nwclientLog1.txt";
var process = require( "process" );
var passed_arguments = process.argv.slice(2);
var upload_file = false;
var server = "";

function stopAndShowValidOptions () {
	console.log('The available arguments are: ');
	console.log('-s | nwn server name for organization | usage: -s sinfar');
	console.log('-u | upload file to sftp (true or false) | usage: -u true');
	console.log('-p | path to log ending with .txt | usage: -p "C:/PathToLog/NWN/nwClientLog1.txt');
	console.log('-d | log destination with no trailing slash | usage: -d "C:/NewLogFolder"');
	console.log('-h | sftp hostname | required if -u true | usage: -h host.sftphostname.com');
	console.log('-l | sftp username | required if -u true | usage: -l mysftpusername');
	console.log('-k | sftp password | required if -u true | usage: -k mysftppassword');
	console.log('-g | sftp port | required if -u true | usage: -g 22');
	console.log('-z | sftp directory with no trailing slash | required if -u true | usage: -z "/nwnlogs"');
	console.log("Invalid argument structure process was aborted.");
	process.exit();
}

// [[ ARGUMENTS ]] 
var args_array = ["s","u","p","d","h","l","k","g","z"];
var flag = "";
if(passed_arguments.toString().indexOf(',') > 0) {
	var parameter_array = passed_arguments.toString().split(',');
	for (i = 0; i < parameter_array.length; i++) { 
		if(parameter_array[i].length == 2 && flag == "" && parameter_array[i].charAt(0) == "-") {
			for(p = 0; p < args_array.length; p++) {
				if(args_array[p] == parameter_array[i].charAt(1)) {
					flag = args_array[p];
					var index = args_array.indexOf(flag);
					args_array.splice(args_array.indexOf(flag), 1);
					break;
				}
			}
			if(flag == "") {
				stopAndShowValidOptions();
			}
		} else if (flag != "") {
			if(flag == "s") {
				server = parameter_array[i];
			} else if(flag == "u") {
				if(parameter_array[i] == "true") {
					upload_file = true;
				} else if(parameter_array[i] == "false") {
					upload_file = false;
				} else {
					stopAndShowValidOptions();
				}
			} else if(flag == "p") {
				if(parameter_array[i].charAt(parameter_array[i].length - 1) == "t" &&
				   parameter_array[i].charAt(parameter_array[i].length - 2) == "x" &&
				   parameter_array[i].charAt(parameter_array[i].length - 3) == "t" &&
				   parameter_array[i].charAt(parameter_array[i].length - 4) == ".") {
					source = parameter_array[i];
				} else {
					stopAndShowValidOptions();
				}
			} else if(flag == "d") {
				if(parameter_array[i].charAt(parameter_array[i].length - 1) == "/"){
					stopAndShowValidOptions();
				}
				output_base_dir = parameter_array[i];
			} else if(flag == "h") {
				sftp_hostname = parameter_array[i];
			} else if(flag == "l") {
				sftp_username = parameter_array[i];
			} else if(flag == "k") {
				sftp_password = parameter_array[i];
			} else if(flag == "g") {
				sftp_port = parameter_array[i];
			} else if(flag == "z") {
				if(parameter_array[i].charAt(parameter_array[i].length - 1) == "/"){
					stopAndShowValidOptions();
				}
				sftp_log_dir = parameter_array[i];
			}
			flag = "";
		} else {
			stopAndShowValidOptions();
		}
	}
}

var fs = require( 'fs' );
var path = require( 'path' );
var replace = require('stream-replace');
var through = require('through');
var FileQueue = require('filequeue');
var fq = new FileQueue(100);

// [[ Build Filename ]] e.g. NWNLog_2013_04_23_192504
var today = new Date();

var monthStr = (today.getMonth() + 1).toString();
if( monthStr.length == 1) monthStr = "0" + monthStr;

var dayStr = today.getDate().toString();
if( dayStr.length == 1) dayStr = "0" + dayStr;

var hourStr = today.getHours().toString();
if( hourStr.length == 1) hourStr = "0" + hourStr;

var minuteStr = today.getMinutes().toString();
if( minuteStr.length == 1) minuteStr = "0" + minuteStr;

var secondStr = today.getSeconds().toString();
if( secondStr.length == 1) secondStr = "0" + secondStr;

var dateString = today.getFullYear() + "_" + monthStr + "_" + dayStr + "_" + hourStr + minuteStr + secondStr;

var fileName = "NWNLog_" + dateString + ".html";

// [[ Build destination folder ]]
var destination = output_base_dir + "/" + server;  
destination = destination + "/" + fileName;

fq.stat( source, function( error, stat ) {

	if( error ) {
		console.error( "Error reading source file.", error );
		return;
	}

	if( stat.isFile() ) {	
		
		var logTitle = "<h4>[<font color='#EEBB33'>Log</font>]" 
				+ " <font color='#8F7FFF'>Date/Time</font>: " + monthStr + '/' + dayStr + '/' + today.getFullYear() + ' ' + hourStr + ":" + minuteStr
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
		
		var reader = fq.createReadStream(source);
		var writer = fq.createWriteStream(destination);
		
		/* DEBUGGER
		reader
		.pipe(filterLogs)
		.pipe(process.stdout);
		*/
		
		reader
		.pipe(filterLogs)
		.pipe(writer);

		if(upload_file == true) {
			writer.on('close', function() {
				uploadToSFTP();
			});
		}
	}					
});

function uploadToSFTP() {
	var Client = require('ssh2-sftp-client');
	var sftp = new Client();
	var fileStats = fs.statSync(destination);
	var fileSizeInBytes = fileStats.size;
	var log_path = sftp_log_dir;
	if(server != "") {
		log_path = log_path + "/" + server + "/" + fileName;
	} else {
		log_path = log_path + "/" + fileName;
	}
	if(fileSizeInBytes >= 1000) {
		/* upload to sftp */
		sftp.connect({
			host: sftp_hostname,
			port: sftp_port,
			username: sftp_username,
			password: sftp_password
		}).then(() => {
			return sftp.put(destination, log_path)
		}).then(() => {
			process.exit();	
		}).catch((err) => {
			console.log(err, 'catch error');
		});
	}
}