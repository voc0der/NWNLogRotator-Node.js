@echo off
echo *** Launching Server ***
start /w /d "C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\" nwmain.exe +connect 127.0.0.1:5121
echo *** Neverwinter Nights Terminated ***
echo *** Processing Logs ***
node RavenLogRotator -s servername -u true -p "C:/Source/nwClientLog.txt" -d "C:/DestinationWithNoSlashAtTheEnd" -h "mysftphostname" -l mysftpusername -k mysftppassword -g 22 -z "/mysftppath"
exit