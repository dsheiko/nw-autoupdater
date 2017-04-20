# CHANGELOG

## 1.1.0
- Update flow is optimized. Now the autoupdater doesn't start up NW.js application for the swap, but delegates this work for a Bash/Batch script. Thus we reduce the total update time.
- Now all the directories used in update procces configurable (backupDir, execDir, updateDir, logDir)
- Everything that is happening during update process is reported in the log file (verbose mode is alos available via configuration)
- One can pass to autoupdater a custom swap script. For example to update not the entire project, but a part of it

## 1.0.0
* first stable version