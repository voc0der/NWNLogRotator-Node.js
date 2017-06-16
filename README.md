# NWN-Log-Rotator
The Neverwinter Nights Log Rotator is designed to parse, format, and colorize logs so that they may be shared and re-read. A very basic and crude example of this in action is <a href="http://htmlpreview.github.io/?https://github.com/Mystique5022/NWN-Log-Rotator/blob/master/v2/NWNLog_2016_08_26_001006.html" target="_blank">here</a>.
<br />
<br />
Before attempting to use this script, please install <a href="https://nodejs.org/en/">node.js</a> to the default location if it is not already. <br />

1) Open a command prompt (Start > Run > Cmd > Enter) 

2) Navigate to the path of **your** NWN install in cmd.exe [ex. cd C:\Program Files (x86)\GOG\Neverwinter Nights\ ] 

3) Ensure these node.js plugins are installed **in that path above** by typing these commands into cmd.exe.
<br />
```
npm install stream-replace
npm install through
npm install filequeue

[*optional if using sftp*]
npm install ssh2-sftp-client 
```
<br />
**Important:** If these commands fail, try opening the command prompt as administrator and trying again. (Right click the shortcut in the start menu > Run As Administrator)

**Note:** npm is the node package manager, and those are the dependencies that this script needs to run.
<br /><br />
Once you are done that, navigate to the latest version folder here on github above and grab sinfarLogRotator.js or amiaLogRotator.js or maybe both!
<br /><br />
Lastly, make sure the file PATHs make sense to YOUR filesystem. K:\NeverwinterNights\NWN... likely won't exist for you. It might be C:\Program Files (x86)\GOG\Neverwinter Nights\

Open amiaLogRotator.js/sinfarLogRotator.js in notepad and change the "source" and "destination" variables to match YOUR filesystem.
<br /> 

To simply test how this thing works, you can try making a one line batch script:
```batch
cmd /c "C:\Program Files\nodejs\node.exe" K:\NeverwinterNights\NWN\amiaLogRotator.js
```

Here is a sample batch file to Rotate Logs. Keep in mind, my set up is a bit more advanced than you might need yours to be. 
```batch
@echo off
echo Loading Amia config..
:: This will copy the nwnplayer.ini from cfg\amia to the NWN folder. Good for multiple account names and shortcuts.
xcopy /y "K:\NeverwinterNights\NWN\cfg\amia\nwnplayer.ini" "K:\NeverwinterNights\NWN\nwnplayer.ini"
echo Done!
:: Start the Neverwinter Nights Client and Automatically connect to Amia A.
echo *** Launching Amia A ***
START /w /d "K:\NeverwinterNights\NWN\" nwmain.exe +connect 185.29.203.11:5121
echo *** Neverwinter Nights Terminated ***
echo Processing Logs...
:: Run the log parser in NodeJS now..
cmd /c "C:\Program Files\nodejs\node.exe" K:\NeverwinterNights\NWN\amiaLogRotator.js
:: Cleanly exit the batch
exit
```

Lastly, if using sftp, change your sftp information to match yours. Otherwise, you can remove or comment out the code beginning with /* upload to sftp */ until the last catch error using /* */ like so
```
/* upload to sftp 
sftp.connect({
	host: 'host.hostcom',
	port: '22',
	username: 'username',
	password: 'password'
}).then(() => {
	return sftp.put(destination, '/misc/sinfar_logs/' + fileName)
}).then(() => {
	process.exit();	
}).catch((err) => {
	console.log(err, 'catch error');
});
*/
```