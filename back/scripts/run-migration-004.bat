@echo off
echo Running Migration 004: Opportunities Table
echo ==========================================
cd /d "%~dp0"
node run-migration-004.js
pause

