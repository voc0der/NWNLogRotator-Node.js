// Author: RaveN
// Date: 06/29/2017
// Version 1.5
// Purpose: NodeJS Neverwinter Nights Log rotator, formatter, and trimmer, and now uploader!

// [[ BASE VARIABLES ]] Hint: There are parameters you can pass, so you don't need to change these here!
var server = "";
var upload_file = false;
var source = "C:/Program Files (x86)/GOG.com/Neverwinter Nights Diamond Edition/Logs/nwclientLog1.txt";
var output_base_dir = "C:/Program Files (x86)/GOG.com/Neverwinter Nights Diamond Edition/Logs";
var sftp_hostname = "";
var sftp_port = "";
var sftp_username = "";
var sftp_password = "";
var sftp_log_dir = "";
var testmode = false;
var logheadeader_color = "FFFFFF";
var minimum_rows = 10;

var process = require( "process" );
var passed_arguments = process.argv.slice(2);

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
	console.log('-t | test mode, disable file write (true or false) | usage: -t true');
	console.log('-c | color of server header | usage: -c 03FFFF');
	console.log('-m | minimum lines before logging | usage: -m 10');
	console.log("Invalid argument structure process was aborted.");
	process.exit();
}

// [[ ARGUMENTS ]] 
var args_array = ["s","u","p","d","h","l","k","g","z","t","c","m"];
var flag = "";
if(passed_arguments.toString().indexOf(',') > 0) {
	var parameter_array = passed_arguments.toString().split(',');
	for (i = 0; i < parameter_array.length; i++) { 
		if(parameter_array[i].length == 2 && flag == "" && parameter_array[i].charAt(0) == "-" && i != (parameter_array.length - 1) ) {
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
			} else if (flag == "t") {
				if(parameter_array[i] == "true") {
					testmode = true;
				} else if(parameter_array[i] == "false") {
					testmode = false;
				} else {
					stopAndShowValidOptions();
				}
			} else if (flag == "c") {
				logheadeader_color = parameter_array[i];
			}
			 else if (flag == "m") {
				minimum_rows = parameter_array[i];
			}
			flag = "";
		} else {
			stopAndShowValidOptions();
		}
	}
}

if(upload_file == true && (sftp_hostname == "" || sftp_username == "" || sftp_password == "" || sftp_port == "") ) stopAndShowValidOptions();

var fs = require( 'fs' );
var path = require( 'path' );

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

fs.readFile(source, "utf8", function( error, data ) {

	if( error ) {
		console.error( "Error reading source file.", error );
		return;
	}
	// Init cap server name
	var server_label = server;
	server_label = server_label.toLowerCase().replace(/\b[a-z]/g, function(letter) {
		return letter.toUpperCase();
	});

	var css = 	"<style>" +
					".logbody { background-color: #000000; font-family: Tahoma, Geneva, sans-serif; color: #FFFFFF; }" +
					".logheader { color: #03FFFF; }" +
					".default { color: #FFFFFF }" +
					".timestamp { color: #B1A2BD; }" +
					".actors { color: #8F7FFF; }" +
					".tells { color: #0F0; }" +
					".whispers { color: #808080; }" +
					".emotes { color: #ffaed6; }" +
				"</style>";

	var logTitle = "<h4>[<span class='logheader'>" + server_label + " Log</span>]" 
			+ " <span class='actors'>Date/Time</span>: " + monthStr + '/' + dayStr + '/' + today.getFullYear() + ' ' + hourStr + ":" + minuteStr
			+ "</h4>";
	var preLog = "<html><body class='logbody'><span class='default'>";
	var postLog = "</span></body></html>";

	var filteredLogs = css + preLog + logTitle + 
	data
	// core format replacements
	.replace(/\[CHAT WINDOW TEXT\] /g, '')
	.replace(/\[{1}[A-z]{3}\s[A-z]{3}\s[0-9]{2}\s/g, '<span class="timestamp">[')
	.replace(/:[0-9]*]{1}/g, ']</span>')
	// additional patterns
	.replace(/.+?(?=.*).{1}Event.{1} .*\r\n/g, '')
	.replace(/.+?(?=.*)Minimum Tumble AC Bonus:\s?\+{1}[0-9]*\r\n/g, '')
	.replace(/Minimum Tumble AC Bonus:\s?\+{1}[0-9]*\r\n/g, '')
	.replace(/.+?(?=.*)No Monk\/Shield AC Bonus:\s?\+{1}[0-9]*\r\n/g, '')
	.replace(/.+?(?=.*)You are light sensitive!\r\n/g, '')
	.replace(/.+?(?=.*)has left as a player..\r\n/g, '')
	.replace(/.+?(?=.*)has joined as a player..\r\n/g, '')
	.replace(/.+?(?=.*)has left as a game master..\r\n/g, '')
	.replace(/.+?(?=.*)has joined as a game master..\r\n/g, '')
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
	.replace(/\]<\/span>((...).*: )/g, ']</span><span class="actors">$1</span>')
	// tells
	.replace(/:\s?<\/span>\s?(\[Tell])(.*.*)/g, '</span><span class="tells">$1:$2</span>')
	// whispers 
	.replace(/:\s?<\/span>\s?(\[Whisper])(.*.*)/g, '</span><span class="whispers"> $1:$2</span>')
	// emotes 
	.replace(/(\*.*\*)/g, '<span class="emotes">$1</span>')
	// html formatting
	.replace(/\r\n/g,'<br />');
	filteredLogs = filteredLogs + postLog;

	var actorOccurences = (filteredLogs.match(/<span class=\"actors\">/g) || []).length;

	if( actorOccurences > minimum_rows) {
		if(testmode == true) {
			// display output in console
			console.log(filteredLogs);
		} else {
			// write output to html
			fs.writeFile(destination, filteredLogs, function(err) {
				if(err) {
					return console.log(err);
				}
			},uploadToSFTP); 
		}			
	}
});

function uploadToSFTP() {
	if(upload_file == true) {
		var Client = require('ssh2-sftp-client');
		var sftp = new Client();
		var log_path = sftp_log_dir;
		if(server != "") {
			log_path = log_path + "/" + server + "/" + fileName;
		} else {
			log_path = log_path + "/" + fileName;
		}
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