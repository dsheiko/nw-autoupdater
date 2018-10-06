const { join  } = require( "path" ),
      fs = require( "fs" ),
      SwapAbstract = require( "./Abstract" );

class SwapWin extends SwapAbstract{

  constructor( options ){
    super( options );
  }
  // @see http://steve-jansen.github.io/guides/windows-batch-scripting/part-2-variables.html
  getScriptContent(){
    return `@echo off
SET execDir=%~1
SET updateDir=%~2
SET backupDir=%~3
SET runner=%~4
SET verbose=%~5
` + (this.options.swapScript ||
`rmdir "%backupDir%" /s /q
robocopy "%execDir%" "%backupDir%" /mir
robocopy "%updateDir%" "%execDir%" /mir

"%execDir%\\%runner%"
`);
  }

  extractScript( homeDir )
  {
    const content = this.getScriptContent(),
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
      const { execDir, updateDir, executable, backupDir, logDir } = this.options;
      return [ execDir, updateDir, backupDir, executable, `false` ];
  }

}

module.exports = SwapWin;
