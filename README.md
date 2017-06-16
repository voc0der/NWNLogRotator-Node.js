# NWN-Log-Rotator
The Neverwinter Nights Log Rotator is designed to parse, format, and colorize logs so that they may be shared and re-read. As of version 3, they also prune logs that are too small, and also upload remotely to sftp. Using the batch file below along with this together will fully automate logging in NWN. A very basic and crude example of this in action is <a href="http://htmlpreview.github.io/?https://github.com/Mystique5022/NWN-Log-Rotator/blob/master/v2/NWNLog_2016_08_26_001006.html" target="_blank">here</a>.
<br />
<br />
Before attempting to use this script, please install <a href="https://nodejs.org/en/">node.js</a> to the default location if it is not already. <br />

1) Open a command prompt (Start > Run > Cmd > Enter).

2) Navigate to the path of **your** NWN install in the command prompt (cmd.exe)
```
cd C:\Program Files (x86)\GOG\Neverwinter Nights\
```

3) Ensure these node.js plugins are installed **in that path above** by typing these commands into cmd.exe.

```
npm install stream-replace
npm install through
npm install filequeue
npm install ssh2-sftp-client 
```

**Note:** npm is the node package manager, and those are the dependencies that this script needs to run. ssh2-sftp-client is optional if not using sftp.

**Important:** If these commands fail, try opening the command prompt as administrator and trying again. To accomplish this, right click the cmd.exe shortcut in the start menu and select *Run As Administrator*.

4) Retrieve the latest version folder versions of sinfarLogRotator.js or amiaLogRotator.js here on this repository.

5) Open amiaLogRotator.js and/or sinfarLogRotator.js in a text editor like Notepad, and change the "source" and "destination" variables **to match your path**.

6) If using sftp, change your sftp information to match yours. Otherwise, you can remove or comment out the code as shown below.
```
/* upload to sftp 
sftp.connect({
	host: 'host.hostcom',
	port: '22',
	username: 'username',
	password: 'password'
}).then(() => {
	return sftp.put(destination, '/remote_path/' + fileName)
}).then(() => {
	process.exit();	
}).catch((err) => {
	console.log(err, 'catch error');
});
*/
```

**Testing:** As a simple test, you can try making a one line batch script:
```batch
cmd /c "C:\Program Files\nodejs\node.exe" C:\Program Files (x86)\GOG\Neverwinter Nights\amiaLogRotator.js
```

**Sample NWN Launcher:** Might be a little more complicated than you need. The *xcopy* line is there optionally, in case you play on multiple servers and different accounts and wanted to automate that!
```batch
@echo off
echo Loading Amia config..
:: This will copy the nwnplayer.ini from cfg\amia to the NWN folder. Good for multiple account names and shortcuts.
xcopy /y "C:\Program Files (x86)\GOG\Neverwinter Nights\cfg\amia\nwnplayer.ini" "C:\Program Files (x86)\GOG\Neverwinter Nights\nwnplayer.ini"
echo Done!
:: Start the Neverwinter Nights Client and Automatically connect to Amia A.
echo *** Launching Amia A ***
START /w /d "C:\Program Files (x86)\GOG\Neverwinter Nights\" nwmain.exe +connect 185.29.203.11:5121
echo *** Neverwinter Nights Terminated ***
echo Processing Logs...
:: Run the log parser in NodeJS now..
cmd /c "C:\Program Files\nodejs\node.exe" C:\Program Files (x86)\GOG\Neverwinter Nights\amiaLogRotator.js
:: Cleanly exit the batch
exit
```