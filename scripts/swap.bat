@echo off
setlocal enableDelayedExpansion

set "options=-app-path:"" -bak-path:"" -update-path:"" -runner:"" -nope:"

for %%O in (%options%) do for /f "tokens=1,* delims=:" %%A in ("%%O") do set "%%A=%%~B"
:loop
if not "%~3"=="" (
  set "test=!options:*%~3:=! "  
  if "!test!"=="!options! " (
      echo Error: Invalid option %~3
  ) else if "!test:~0,1!"==" " (
      set "%~3=1"
  ) else (
      setlocal disableDelayedExpansion      
      set "val=%~4"
      call :escapeVal
      setlocal enableDelayedExpansion
      for /f delims^=^ eol^= %%A in ("!val!") do endlocal&endlocal&set "%~3=%%A" !
      shift /3
  )
  shift /3
  goto :loop
)
goto :endArgs
:escapeVal
set "val=%val:^=^^%"
set "val=%val:!=^!%"
exit /b
:endArgs

set -

:: To get the value of a single parameter, just remember to include the `-`

echo The value of -app-path is: !-app-path!
echo The value of -app-path is: !-bak-path!
echo The value of -app-path is: !-update-path!
echo The value of -app-path is: !-runner!

rem rmdir !-bak-path! /s /q
rem xcopy !-app-path! !-bak-path! /e /i /h
rem xcopy !-update-path! !-app-path! /e /i /h
