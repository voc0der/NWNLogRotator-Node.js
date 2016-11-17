# NWN-Log-Rotator
The Neverwinter Nights Log Rotator is designed to parse, format, and colorize logs so that they may be shared and re-read.
<br />
<br />
The code is accessible using NodeJS (in a command prompt) with the following plugins:
<br />
```
npm install through
npm install stream-replace
npm install filequeue
```

<br />
Sample Bat to Rotate Logs
```batch
@echo off
echo Loading Amia config..
xcopy /y "K:\NeverwinterNights\NWN\cfg\amia\nwnplayer.ini" "K:\NeverwinterNights\NWN\nwnplayer.ini"
echo Done!
echo *** Launching Amia A ***
START /w /d "K:\NeverwinterNights\NWN\" nwmain.exe +connect 185.29.203.11:5121
echo *** Neverwinter Nights Terminated ***
echo Processing Logs...
cmd /c "C:\Program Files\nodejs\node.exe" K:\NeverwinterNights\NWN\amiaLogRotator.js
echo Cleaning Amia Dropbox...
START /w hstart64.exe /NOCONSOLE "K:\NeverwinterNights\NWN\cleandropbox.bat" 
exit
```

<br />
An example of this in action is <a href="http://htmlpreview.github.io/?https://github.com/Mystique5022/NWN-Log-Rotator/blob/master/v2/NWNLog_2016_08_26_001006.html" target="_blank">here</a>.