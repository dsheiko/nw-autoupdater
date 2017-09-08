const { join  } = require( "path" ),
      { launch } = require( "../utils" ),
      { swapFactory } = require( "../env" );

  /**
   * Restart and launch detached swap
   * @returns {Promise}
   */
  async function restartToSwap(extraArgs = []){
    const { updateDir, logPath } = this.options,
          swap = swapFactory( this.options ),
          args = swap.getArgs().concat( extraArgs );

    swap.extractScript( updateDir );
    await launch( swap.getRunner(), args, updateDir, logPath );
    nw.App.quit();
  }


exports.restartToSwap = restartToSwap;
