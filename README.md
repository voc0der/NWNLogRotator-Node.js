# NWN-Log-Rotator
The Neverwinter Nights Log Rotator is designed to parse, format, and colorize logs so that they may be shared and re-read. The log rotator can also optionally upload remotely to sftp. With the batch file below along with this, it is easy to fully automate logging in NWN in a colorful way! A very basic example of this in action is <a href="http://htmlpreview.github.io/?https://github.com/Mystique5022/NWN-Log-Rotator/blob/master/latest/NWNLog_2016_08_26_001006.html" target="_blank">here</a>.
<br />
<br />
Before attempting to use this script, please install <a href="https://nodejs.org/en/">node.js</a> to the default location if it is not already. <br />

*If you already have default NWN logging enabled proceed to step 5.*
1) Go to C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\ or **your** NWN Base directory. 

2) Open nwnplayer.ini and ensure that ClientEntireChatWindowLogging = 1 under "[Game Options]".

3) Start NWN, join a server, and spam a few chat lines through chat for the logger. 

4) Then in your NWN base directory go to /Logs and ensure nwclientLog1.txt exists and looks correct.

5) Open a command prompt (Open the Start Menu, then click "run". In the dialog box, type "cmd" then hit enter).

6) Navigate to the path of **your** NWN install in the command prompt (cmd.exe):
```
cd C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\
```

7) Ensure these node.js plugins are installed **in that path above** by typing these commands into cmd.exe.

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

8) Retrieve the latest RavenLogRotator.js here on this repository and place it in your base NWN directory.

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
start /w /d "C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\" nwmain.exe +connect 127.0.0.1:5121
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
start /w /d "C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\" sinfarx.exe +connect 127.0.0.1:5121
:loop
timeout /t 10 /nobreak > nul
tasklist /fi "imagename eq nwmain.exe" |find ":" > nul
if errorlevel 1 goto loop
node RavenLogRotator -s servername -u true -p "C:/Source/nwClientLog.txt" -d "C:/DestinationWithNoSlashAtTheEnd" -h "mysftphostname" -l mysftpusername -k mysftppassword -g 22 -z "/mysftppath"
exit
```

**Tips:** 

- If you play on multiple servers, it's easier to make a launcher for each, and then a shortcut on the desktop. Make sure the shortcuts are configured to *Run as Administrator*.

- Want to *hide* the command prompt in your shortcut? Easy! Download <a href="http://www.ntwind.com/blog/hstart-x64.html">hstart or hstart64</a> and unzip the exe in your NWN Base Directory. Once it's there, create a starter batch file.. that calls the Sample_NWN_Launcher.bat from above using the hstart to make it hidden. 
```batch
start hstart64.exe /noconsole "C:\Program Files (x86)\GOG.com/Neverwinter Nights Diamond Edition\Sample_NWN_Launcher.bat" 
```
Once it works, you can make a shortcut to that batch file. Make sure the shortcuts are configured to *Run as Administrator*.