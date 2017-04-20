const { join  } = require( "path" ),
      fs = require( "fs" ),
      SwapAbstract = require( "./Abstract" );

class SwapWin extends SwapAbstract{

  constructor( options ){
    super( options );
  }

  getScriptContent(){
    return `@echo off
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

rem rmdir !-bak-path! /s /q
rem xcopy !-app-path! !-bak-path! /e /i /h
rem xcopy !-update-path! !-app-path! /e /i /h

!-runner!
`;
  }

  extractScript( homeDir )
  {
    // @see http://steve-jansen.github.io/guides/windows-batch-scripting/part-2-variables.html
    const content = this.getSwapScriptContent(),
          scriptPath = join( homeDir, "swap.bat" );
    fs.writeFileSync( scriptPath, content, "utf8" );
    this.scriptPath = scriptPath;
  }

/**
   * Get args for swap script
   * @returns {Array}
   */
  getArgs()
  {
      const { execDir, updateDir, executable, backupDir, logDir  } = this.options;
      return [ `-app-path=${execDir}`, `-update-path=${updateDir}`, `-runner=${executable}`,
            `-bak-path=${backupDir}` ];
  }

}

module.exports = SwapWin;
