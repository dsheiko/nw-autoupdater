# CHANGELOG

## 1.1.1
- Symlinks with absolute paths in temp folder on macOS https://github.com/dsheiko/nw-autoupdater/issues/6
- New constructor option `accumulativeBackup`
- example/server that watches for changes in directory releases and updates the manifest accordingly

## 1.1.0
- Code refactored for better readability and maintainability
- Added a new update strategy ScriptSwap - where the autoupdater doesn't start up NW.js application for the swap, but delegates this work for a Bash/Batch script. Thus we reduce the total update time.
- Now all the directories used in update procces configurable (backupDir, execDir, updateDir, logPath)
- Everything that is happening during update process is reported in the log file (verbose mode is alos available via configuration)
- One can pass to autoupdater a custom swap script. For example to update not the entire project, but a part of it

## 1.0.0
* first stable version