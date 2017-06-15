# NWN-Log-Rotator
The Neverwinter Nights Log Rotator is designed to parse, format, and colorize logs so that they may be shared and re-read. A very basic and crude example of this in action is <a href="http://htmlpreview.github.io/?https://github.com/Mystique5022/NWN-Log-Rotator/blob/master/v2/NWNLog_2016_08_26_001006.html" target="_blank">here</a>.
<br />
<br />
To begin, please install <a href="https://nodejs.org/en/">NodeJS</a> to the default location if it is not already. <br />

Open a command prompt (Start > Run > Cmd > Enter) 

Type cd C:\...NeverwinterNightsPath\ (use yours)

Ensure these NodeJS plugins are installed in that path by typing these commands.
<br />
```
npm install stream-replace
npm install through
npm install filequeue
npm install ssh2-sftp-client
```
<br />
If these commands fail, try opening the command prompt as administrator and trying again. (Right click the shortcut in the start menu > Run As Administrator)

Typing these three commands will ensure that the dependencies are installed properly and that the script will work.
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