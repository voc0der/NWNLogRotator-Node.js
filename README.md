# NWN-Log-Rotator
This Neverwinter Nights Log Rotator, RavenLogRotator, is designed to parse, format, and colorize logs so that they may be shared and re-read much easier. The log rotator can also optionally upload remotely to sftp. It is easily able to be used with either Neverwinter Nights 1.69 or the Enhanced Edition.

With help of the batch file below along with RavenLogRotator, it is easy to fully automate logging in NWN in a colorful way! 

<a href="https://ravenmyst.net/work/nwnlogrotator/" target="_blank">Click here to go to web version of NWN Log Rotator or to see a live demo</a>.
<br />
<br />
**Required Files:**

- This script requires <a href="https://nodejs.org/en/">Node.js</a> to be installed.<br />
- Place the latest version of [RavenLogRotator.js](../master/RavenLogRotator.js) in your NWN Base directory.

**Enabling NWN Logging:**

1) Navigate in Windows Explorer to **your** base Neverwinter Nights directory.<br />
```
# Default Neverwinter Nights 1.69:
C:\Program Files (x86)\Neverwinter Nights\
```
```
# Steam Neverwinter Nights: Enhanced Edition:
C:\Users\<user>\Documents\Neverwinter Nights\ 
```

2) Open nwnplayer.ini and ensure the following line is exists within the section and has the right value.
```
[Game Options]
ClientEntireChatWindowLogging = 1
```

**Test NWN Logging:**
1) Start NWN, join a server, and spam a few about two dozen lines through chat for the logger.
2) Close NWN, then in your NWN base directory go to /Logs and ensure nwclientLog1.txt exists and looks correct.

**Test RavenLogRotator:**

1) Open a command prompt in windows.
2) Navigate to the path of **your** NWN install in the command prompt (cmd.exe):
```batch
# Default Neverwinter Nights 1.69:
cd C:\Program Files (x86)\Neverwinter Nights\

# Steam Neverwinter Nights: Enhanced Edition:
cd C:\Users\<user>\Documents\Neverwinter Nights\
```
3) Try calling RavenLogRotator in node.
```batch
# Neverwinter Nights 1.69:
node RavenLogRotator 

# Neverwinter Nights: Enhanced Edition: -p is required
# Steam default usage example below (change <user> to your windows user)
node RavenLogRotator -p "C:/Users/<user>/Documents/Neverwinter Nights/logs/nwClientLog1.txt"
```
The following flags are available for use to further configure RavenLogRotator.

| Flag  | Description | Default | Usage | Required for EE |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| -s | nwn server name | "" | -s servername | no |
| -u | upload to sftp | false | -u true | no |
| -p | path to log | "/Logs/nwclientLog1.txt" | -p "C:/nwnlogs/nwClientLog1.txt" | yes |
| -d | log destination | "/Logs" | -p "C:/nwnlogs/" | no |
| -h | sftp hostname | "" | -h host.sftphostname.com | no |
| -l | sftp username | "" | -l mysftpusername | no |
| -k | sftp password | "" | -k mysftppassword | no |
| -g | sftp port | "" | -g 22 | no |
| -z | sftp directory| "" | -z "/nwnlogs" | no |
| -t | test only | false | -t true | no |
| -c | server name color | "FFFFFF" | -c 03FFFF | no |
| -m | minimum rows to log | "10" | -m 25 | no |
| -f | log combat text | true | -f false | no |
| -e | event text (spam) | false | -e true | no |

**Important:** Only if you ***are*** using using sftp enter this line to install ssh-sftp-client from the node package manager (npm).
```batch
npm install ssh2-sftp-client
```
If this command fails, try installing it with the -g (global flag) or try opening the command prompt as administrator and trying again. To accomplish this, right click the cmd.exe shortcut in the start menu and select *Run As Administrator*.

**Advanced Flag Usage Example:**

To test the usage of RavenLogRotator with advanced parameters, you can copy and paste this into the Command Prompt by right clicking in the black window and hitting paste (cmd.exe).
```
node RavenLogRotator -s servername -u true -p "C:/Source/nwClientLog.txt" -d "C:/DestinationWithNoSlashAtTheEnd" -h "mysftphostname" -l mysftpusername -k mysftppassword -g 22 -z "/mysftppath"
```

Repeat running it, changing flags and their values until you reach the desired operation. If was successful, it will create a .html file both in the destination (-d) and if you chose to upload in the sftp zone (-z).

**Automate Logging when playing NWN:** 

Place the following bat file in the NWN base directory and modify it to your specifications.

**[NWN_Launcher.bat](../master/launchers/NWN_Launcher.bat):** Basic Launcher Example.

If you play on a server with custom launchers, you will need to do something a little different. 

**[NWN_With_Launcher.bat](../master/launchers/NWN_With_Launcher.bat):** Server with Launcher Example (Requires to be *Run as Administrator*).