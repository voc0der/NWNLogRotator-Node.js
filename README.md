# NWN-Log-Rotator
The Neverwinter Nights Log Rotator is designed to parse, format, and colorize logs so that they may be shared and re-read. As of version 3, they also prune logs that are too small, and also upload remotely to sftp. Using the batch file below along with this together will fully automate logging in NWN. A very basic and crude example of this in action is <a href="http://htmlpreview.github.io/?https://github.com/Mystique5022/NWN-Log-Rotator/blob/master/latest/v3/NWNLog_2016_08_26_001006.html" target="_blank">here</a>.
<br />
<br />
Before attempting to use this script, please install <a href="https://nodejs.org/en/">node.js</a> to the default location if it is not already. <br />

1) Open a command prompt (Open the Start Menu, then click "run". In the dialog box, type "cmd" then hit enter).

2) Navigate to the path of **your** NWN install in the command prompt (cmd.exe):
```
cd C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\
```

3) Ensure these node.js plugins are installed **in that path above** by typing these commands into cmd.exe.

```
npm install stream-replace
npm install through
npm install filequeue 
```

**Note:** npm is the node package manager, and those are the dependencies that this script needs to run. ssh2-sftp-client is optional if not using sftp. If you **are** using sftp include this line.
```
npm install ssh2-sftp-client
```

**Important:** If these commands fail, try opening the command prompt as administrator and trying again. To accomplish this, right click the cmd.exe shortcut in the start menu and select *Run As Administrator*.

4) Retrieve the latest RavenLogRotator.js here on this repository and place it in your base NWN directory.

**Testing:** with the Command prompt open, type the following: [Hint: You will want to make sure you have a decently sized log file available as a source.]
```batch
node RavenLogRotator 
```
by default, it might not work with your settings. The following flags are accessible to help specify it for your configuration:
```
-s | nwn server name for organization | usage: -s sinfar
-u | upload file to sftp (true or false) | usage: -u true
-p | path to log ending with .txt | usage: -p "C:/PathToLog/NWN/nwClientLog1.txt"
-d | log destination with no trailing slash | usage: -d "C:/NewLogFolder"
-h | sftp hostname | required if -u true | usage: -h host.sftphostname.com
-l | sftp username | required if -u true | usage: -l mysftpusername
-k | sftp password | required if -u true | usage: -k mysftppassword
-g | sftp port | required if -u true | usage: -g 22
-z | sftp directory with no trailing slash | required if -u true | usage: -z "/nwnlogs"
```

**Sample_NWN_Launcher.bat:** Implementing the node into your nwn launch bat is easy to do. The following is a sample implementation.
Note: The *xcopy* line is there optionally, in case you play on multiple servers and different accounts and wanted to automate that!
```batch
@echo off
echo Loading Amia config..
:: This will copy the nwnplayer.ini from cfg\amia to the NWN folder. Good for multiple account names and shortcuts.
xcopy /y "C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\cfg\amia\nwnplayer.ini" "C:\Program Files (x86)\GOG\Neverwinter Nights\nwnplayer.ini"
echo Done!
:: Start the Neverwinter Nights Client and Automatically connect to Amia A.
echo *** Launching Amia A ***
START /w /d "C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\" nwmain.exe +connect 185.29.203.11:5121
echo *** Neverwinter Nights Terminated ***
echo Processing Logs...
:: Run the log parser in NodeJS now..
node RavenLogRotator -s servername -u true -p "C:/Source/nwClientLog.txt" -d "C:/DestinationWithNoSlashAtTheEnd" -h "mysftphostname" -l mysftpusername -k mysftppassword -g 22 -z "/mysftppath"
:: Cleanly exit the batch
exit
```