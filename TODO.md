# Idea

I'm going to use a platform specific script (bash or bat) for swapping and gaining therefore a performance boost as we will not need to
start NWJS for swap.

This script on invokation piped to a file autoupdate.log in the folder of the project.

Scripts cannot be located in packaged project, but instead autoupdater can write them in tmp before calling restartForSwap.

Handling decompressor errors (case archive delivered corrupted)

Configuration options to optionaly set what-to-copy and where-to

