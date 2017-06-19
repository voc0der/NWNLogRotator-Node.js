# NWN-Log-Rotator
The Neverwinter Nights Log Rotator is designed to parse, format, and colorize logs so that they may be shared and re-read. The log rotator can also optionally upload remotely to sftp. With the batch file below along with this, it is easy to fully automate logging in NWN in a colorful way! A very basic example of this in action is <a href="http://htmlpreview.github.io/?https://github.com/Mystique5022/NWN-Log-Rotator/blob/master/latest/NWNLog_2016_08_26_001006.html" target="_blank">here</a>.
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
The default settings are as follows:
``` 
-s[erver] = ""
-u[upload] = false
-p[ath_to_log] = C:/Program Files (x86)/GOG.com/Neverwinter Nights Diamond Edition/Logs/nwclientLog1.txt
-d[estination_log] = C:/Program Files (x86)/GOG.com/Neverwinter Nights Diamond Edition/Logs
-h[ostname_sftp] = ""
-l[ogin username_sftp] = ""
-k[ey_or_password_sftp] = ""
-g[ate_port_sftp] = ""
-z[one_directory_sftp] = ""
```

**Sample_NWN_Launcher.bat:** Implementing the node into your nwn launch bat is easy to do. The following is a sample implementation.
```batch
@echo off
echo *** Launching Server ***
START /w /d "C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\" nwmain.exe +connect 127.0.0.1:5121
echo *** Neverwinter Nights Terminated ***
echo Processing Logs...
node RavenLogRotator -s servername -u true -p "C:/Source/nwClientLog.txt" -d "C:/DestinationWithNoSlashAtTheEnd" -h "mysftphostname" -l mysftpusername -k mysftppassword -g 22 -z "/mysftppath"
exit
```
If you play on a server with custom launchers (i.e. sinfarx.exe), you will need to do something a little different. 
**This method requires you to run the batch as administrator.**
```batch
@echo off
echo *** Launching Server ***
START /w /d "C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\" sinfarx.exe +connect 127.0.0.1:5121
:loop
timeout /t 10 /nobreak > nul
tasklist /fi "imagename eq nwmain.exe" |find ":" > nul
if errorlevel 1 goto loop
node RavenLogRotator -s servername -u true -p "C:/Source/nwClientLog.txt" -d "C:/DestinationWithNoSlashAtTheEnd" -h "mysftphostname" -l mysftpusername -k mysftppassword -g 22 -z "/mysftppath"
exit
```
Tip: If you play on multiple servers, it's easier to make a launcher for each, and then a shortcut on the desktop. Make sure the shortcuts run with Administrative Priviledges.
