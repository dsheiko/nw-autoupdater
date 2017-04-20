const { join  } = require( "path" ),
      fs = require( "fs" ),
      SwapAbstract = require( "./Abstract" );

class  SwapMac extends SwapAbstract {

  constructor( options ){
    super( options );
  }

  extractScript( homeDir )
  {
    let content = this.getScriptContent() + `open -a $(RUNNER)`,
        scriptPath = join( homeDir, "swap.sh" );
    fs.writeFileSync( scriptPath, content, "utf8" );
    this.scriptPath = scriptPath;
  }

}

module.exports =  SwapMac;
