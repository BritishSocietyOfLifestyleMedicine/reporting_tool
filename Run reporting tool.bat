@echo off
if exist "%PROGRAMFILES%\Mozilla Firefox\firefox.exe" start "" "%PROGRAMFILES%\Mozilla Firefox\firefox.exe" http://localhost:8000
    else start "" http://localhost:8000

start bslmReportingServer\dist\reportingServer.exe

