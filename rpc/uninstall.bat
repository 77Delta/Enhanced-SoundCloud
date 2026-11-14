@echo off
set "VBS=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\enhanced-soundcloud-rpc.vbs"
del "%VBS%" 2>nul
echo Startup entry removed.
echo To stop the running bridge now: log out and in again, or end "Node.js" in Task Manager.
echo Then you can delete the folder %LOCALAPPDATA%\enhanced-soundcloud-rpc
pause
