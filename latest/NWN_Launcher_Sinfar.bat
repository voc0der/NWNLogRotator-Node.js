@echo off
echo *** Launching Server ***
start /w /d "C:\Program Files (x86)\GOG\Neverwinter Nights Diamond Edition\" sinfarx.exe +connect play.sinfar.net
:loop
timeout /t 1 /nobreak > nul
tasklist /fi "imagename eq nwmain.exe" |find ":" > nul
if errorlevel 1 goto loop
node RavenLogRotator -s servername -u true -p "C:/Source/nwClientLog.txt" -d "C:/DestinationWithNoSlashAtTheEnd" -h "mysftphostname" -l mysftpusername -k mysftppassword -g 22 -z "/mysftppath"
exit