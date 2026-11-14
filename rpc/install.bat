@echo off
setlocal
set "DEST=%LOCALAPPDATA%\enhanced-soundcloud-rpc"
set "VBS=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\enhanced-soundcloud-rpc.vbs"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js not found. Install it from https://nodejs.org ^(LTS^), then run this again.
    pause
    exit /b 1
)

if not exist "%DEST%" mkdir "%DEST%"
copy /y "%~dp0bridge.js" "%DEST%\" >nul
copy /y "%~dp0package.json" "%DEST%\" >nul
cd /d "%DEST%"
call npm install --omit=dev --no-audit --no-fund
if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
)

> "%VBS%" echo Set sh = CreateObject("WScript.Shell")
>> "%VBS%" echo sh.CurrentDirectory = "%DEST%"
>> "%VBS%" echo sh.Run "node bridge.js", 0, False
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*enhanced-soundcloud-rpc*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
wscript "%VBS%"

echo.
echo Done. Bridge is running and will start at every login.
pause
