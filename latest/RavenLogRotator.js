// Author: RaveN
// Date: 07/14/2017
// Version 1.66
// Purpose: NodeJS Neverwinter Nights Log rotator, formatter, and trimmer, and now uploader!

var process = require( "process" );
var fs = require( 'fs' );
var path = require( 'path' );
var passed_arguments = process.argv.slice(2);
var pwd = process.cwd().replace(/\\/g, "/");
var nwnplayer = pwd + "/nwnplayer.ini";

// base variables (flags control these)
var server = "";
var upload_file = false;
var source = pwd + "/Logs/nwclientLog1.txt";
var output_base_dir = pwd + "/Logs";
var sftp_hostname = "";
var sftp_port = "";
var sftp_username = "";
var sftp_password = "";
var sftp_log_dir = "";
var testmode = false;
var logheadeader_color = "FFFFFF";
var minimum_rows = 10;
var combat_text = true;
var event_text = false;

// check nwnplayer.ini for chat logging
if (fs.existsSync(nwnplayer)){
	fs.readFile(nwnplayer, "utf8", function( error, data ) {
		if( error ) {
			console.error( "Error reading nwnplayer.ini", error );
			return;
		}
		if(data.match(/ClientEntireChatWindowLogging\s?={1}\s?0{1}.*/g) != null) {
			console.log('WARNING: The Neverwinter Nights installed on this system has not yet been configured to enable text logging.')
		}
	});
}

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
	console.log('-f | show combat text | usage: -f false');
	console.log('-e | show event text (mostly spam) | usage: -e true')
	console.log("Invalid argument structure process was aborted.");
	process.exit();
}

// arguments
var args_array = ["s","u","p","d","h","l","k","g","z","t","c","m","f","e"];
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
			} else if (flag == "m") {
				minimum_rows = parameter_array[i];
			} else if (flag == "f") {
				if(parameter_array[i] == "true") {
					combat_text = true;
				} else if(parameter_array[i] == "false") {
					combat_text = false;
				} else {
					stopAndShowValidOptions();
				}
			} else if (flag == "e") {
				if(parameter_array[i] == "true") {
					event_text = true;
				} else if(parameter_array[i] == "false") {
					event_text = false;
				} else {
					stopAndShowValidOptions();
				}
			}
			flag = "";
		} else {
			stopAndShowValidOptions();
		}
	}
}

if(upload_file == true && (sftp_hostname == "" || sftp_username == "" || sftp_password == "" || sftp_port == "") ) stopAndShowValidOptions();

// filename (ex. NWNLog_2013_04_23_192504)
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

// destination folder
var destination = output_base_dir + "/" + server;  
if (!fs.existsSync(destination)){
    fs.mkdirSync(destination);
}
destination = destination + "/" + fileName;

fs.readFile(source, "utf8", function( error, data ) {

	if( error ) {
		console.error( "Error reading NWN log file.", error );
		return;
	}
	var server_label = server;
	server_label = server_label.toLowerCase().replace(/\b[a-z]/g, function(letter) {
		return letter.toUpperCase();
	});
	if(server_label != "") server_label = server_label + " ";

	var css = 	"<head>" +
					"<style>" +
						".logbody { background-color: #000000; font-family: Tahoma, Geneva, sans-serif; color: #FFFFFF; }" +
						".logheader { color: #03FFFF; }" +
						".default { color: #FFFFFF }" +
						".timestamp { color: #B1A2BD; }" +
						".actors { color: #8F7FFF; }" +
						".tells { color: #0F0; }" +
						".whispers { color: #808080; }" +
						".emotes { color: #ffaed6; }" +
					"</style>" +
				"</head>";

	var logTitle = "<h4>[<span class='logheader'>" + server_label + "Log</span>]" 
			+ " <span class='actors'>Date/Time</span>: " + monthStr + '/' + dayStr + '/' + today.getFullYear() + ' ' + hourStr + ":" + minuteStr
			+ "</h4>";
	var preLog = "<html>" + css + "<body class='logbody'><span class='default'>" + logTitle;
	var postLog = "</span></body></html>";

	// combat text removal
	if(combat_text == false) {
		data = data
		.replace(/.+?(?=.*)\*{1}hit\*{1}.*\s\:\s\(\d{1,}\s\+\s\d{1,}\s\=\s\d{1,}.*\){1}\r\n/g, '')
		.replace(/.+?(?=.*)damages\s.*\:\s{1}\d{1,}\s{1}\({1}\d{1,}\s{1}.*\){1}\r\n/g, '')
		.replace(/.+?(?=.*)\*{1}parried\*{1}.*\({1}\d{1,}.*\){1}\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}[a-zA-Z]*\:{1}\s{1}Damage\s{1}[a-zA-Z]*\s{1}absorbs\s{1}.*\r\n/g, '')
		.replace(/.+?(?=.*)\*{1}target concealed\:{1}.*\:{1}\s{1}\({1}\d{1,}.*\){1}\r\n/g, '')
		.replace(/.+?(?=.*)\*{1}critical hit\*\s{1}\:{1}\s{1}\({1}\d{1,}.*\){1}\r\n/g, '')
		.replace(/.+?(?=.*)\*{1}resisted\*\s{1}\:{1}\s{1}\({1}\d{1,}.*\){1}\r\n/g, '')
		.replace(/.+?(?=.*)Immune\s{1}to\s{1}Critical\s{1}Hits\.{1}\r\n/g, '')
		.replace(/.+?(?=.*)\*{1}miss\*{1}.*\s\:\s\(\d{1,}\s{1}.*\d{1,}\s\=\s\d{1,}\)\r\n/g, '')
		.replace(/.+?(?=.*)\*{1}success\*{1}\s{1}\:{1}\s{1}\(\d{1,}.*\){1}\r\n/g, '')
		.replace(/.+?(?=.*)\*{1}failure\*{1}.*\s\:\s{1}\({1}.*\){1}\r\n/g, '')
		.replace(/.+?(?=.*)\:\s{1}Initiative\s{1}Roll\s{1}\:\s\d{1,}\s\:\s\(\d{1,}\s\+\s{1}\d{1,}\s{1}\={1}\s{1}\d{1,}\){1}\r\n/g, '')
		.replace(/.+?(?=.*)\:{1}\s{1}Damage Immunity\s{1}absorbs.*\r\n/g, '')
		.replace(/.+?(?=.*)\:{1}\s{1}Immune to Sneak Attacks\.{1}\r\n/g, '')
		.replace(/.+?(?=.*)\:{1}\s{1}Immune to Negative Levels\.{1}\r\n/g, '')
		.replace(/.+?(?=.*)\:{1}\s{1}Spell Level Absorption absorbs\s{1}\d{1,}.*\:{1}\s{1}\d{1,}.*\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}[a-zA-Z]*cast.*\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}[a-zA-Z]*uses.*\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}[a-zA-Z]*enables.*\r\n/g, '')
		.replace(/.+?(?=.*)[a-zA-Z]*\s{1}attempts\s{1}to\s{1}.*\:\s{1}.*\r\n/g, '')
		.replace(/.+?(?=.*)[a-zA-Z]*\:{1}\s{1}Healed\s{1}\d{1,}\s{1}hit.*\r\n/g, '')
		.replace(/.+?(?=.*)[a-zA-Z]*\:{1}\sImmune to [a-zA-Z]*.*\.{1}\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}Dispel\s{1}Magic\s{1}\:{1}\s{1}[a-zA-z]*.*\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}Experience Points Gained\:{1}\s{1,}\d{1,}\r\n/g, '')
		.replace(/.+?(?=.*)There are signs of recent fighting here...\*{1}\r\n/g, '')
		.replace(/.+?(?=.*)Stale temporary properties detected, cleaning item\.{1}\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}\[Check for loot\:{1}\s{1}\d{1,}.*\]{1}\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}You.{1}ve reached your maximum level.\s{1}.*\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}Devastating Critical Hit!\r\n/g, '')
		.replace(/.+?(?=.*)\s{1,}Done resting\.{1}.*\r\n/g, '')
		.replace(/.+?(?=.*)\s{1,}You triggered a Trap!{1}.*\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}You cannot target a creature you cannot see or do not have a line of sight to\.{1}\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}Weapon equipped as a one-handed weapon.\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}You cannot rest so soon after exerting yourself.\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}Equipping this armor has disabled your monk abilities.\r\n/g, '')
		.replace(/.+?(?=.*)\s{1}No resting is allowed in this area.\r\n/g, '');
	}

	// event text removal
	if(event_text == false) {
		data = data
		.replace(/.+?(?=.*).{1}Event.{1} .*\r\n/g, '')
		.replace(/.+?(?=.*)Minimum Tumble AC Bonus:\s?\+{1}[0-9]*\r\n/g, '')
		.replace(/Minimum Tumble AC Bonus:\s?\+{1}[0-9]*\r\n/g, '')
		.replace(/.+?(?=.*)No Monk\/Shield AC Bonus:\s?\+{1}[0-9]*.*\r\n/g, '')
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
		.replace(/.+?(?=.*)This container is persistent.\r\n/g, '')
		.replace(/.+?(?=.*)This container is full.\r\n/g, '')
		.replace(/.+?(?=.*)You are too busy to barter now.\r\n/g, '')
		.replace(/.+?(?=.*)Player not found.\r\n/g, '')
		.replace(/.+?(?=.*)You cannot carry any more items, your inventory is full.\r\n/g, '')
		.replace(/.+?(?=.*)This is a trash, its contents may be purged at anytime.\r\n/g, '')
		.replace(/.+?(?=.*)Armor\/Shield Applies: Skill .*\r\n/g, '')
		.replace(/.+?(?=.*)\-{1}\s{1}Your character has been saved\.{1}\s{1}\-{1}\r\n/g, '')
		.replace(/.+?(?=.*)New Value: [0-9]*\r\n/g, '')
		.replace(/.+?(?=.*)Quick bar\s{1}.*loaded in.*\r\n/g, '')
	}

	var filteredLogs = preLog + data
	// core format replacements
	.replace(/\[CHAT WINDOW TEXT\] /g, '')
	.replace(/\[{1}[A-z]{3}\s[A-z]{3}\s[0-9]{2}\s/g, '<span class="timestamp">[')
	.replace(/:[0-9]*]{1}/g, ']</span>')
	// actors
	.replace(/\]<\/span>((...).*: )/g, ']</span><span class="actors">$1</span>')
	// tells
	.replace(/:\s?<\/span>\s?(\[Tell])(.*.*)/g, '</span><span class="tells"> $1:$2</span>')
	// whispers 
	.replace(/:\s?<\/span>\s?(\[Whisper])(.*.*)/g, '</span><span class="whispers"> $1:$2</span>')
	// emotes 
	.replace(/(\*.*\*)/g, '<span class="emotes">$1</span>')
	// html formatting
	.replace(/\r\n/g,'<br />') + postLog;

	var actorOccurences = (filteredLogs.match(/<span class=\"actors\">/g) || []).length;

	if( actorOccurences > minimum_rows) {
		if(testmode == true) {
			// display output in console
			console.log(filteredLogs);
			console.log('actors: ' + actorOccurences);
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

// sftp
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