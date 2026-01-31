@echo off
echo Starting CloudTab Backend Server...
cd /d "%~dp0backend"
node src/server.js
pause