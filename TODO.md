# Idea

I'm going to use a platform specific script (bash or bat) for swapping and gaining therefore a performance boost as we will not need to
start NWJS for swap.

Scripts cannot be located in packaged project, but instead autoupdater can write them in tmp before calling restartForSwap.

