# NW-Autoupdater v1.1
[![NPM](https://nodei.co/npm/nw-autoupdater.png)](https://nodei.co/npm/nw-autoupdater/)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdsheiko%2Fnw-autoupdater.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdsheiko%2Fnw-autoupdater?ref=badge_shield)
[![Join the chat at https://gitter.im/dsheiko/nw-autoupdater](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dsheiko/nw-autoupdater?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Library provides low-level API to control NW.js app auto-updates. This project can be seen as a reincarnation of
[node-webkit-updater](https://github.com/edjafarov/node-webkit-updater), which is not maintained anymore.

## Features
- Node >= 7 compliant
- clean async/await syntax
- supports both Zip/Tar.Gz archives
- fires download/install progress events

#### Strategy ScriptSwap
![Autoupdater in action](https://github.com/dsheiko/nw-autoupdater/raw/master/nw-autoupdater.gif)

:video_camera: [Screencast: Running nw-autoupdater examples in the terminal on Ubuntu](https://www.youtube.com/watch?v=q0La7cgXMpg)

# What do we do to autoupdate (see [demo A](example/client-strategy-script/index.html) or [demo B](example/client-strategy-app/index.html))
- `readRemoteManifest` reads manifest from the remote release server
- `checkNewVersion( rManifest )` checks if the version in the remote manifest greater than one of the local manifest
- If the remote manifest doesn't have newer version, skips the update flow
  - We subscribe for `download` events
  - We subscribe for `install` events
- `download( rManifest )` downloads the latest available release matching the host platform (according to the `packages` map of the remote manifest)
- `unpack( updateFile )` unpacks the release archive (`zip` or `tar.gz`) in a temporary directory
- Strategy AppSwap
  - `restartToSwap( extraArgs )` closes the app and launches the downloaded release
  - `isSwapRequest()` - checks if we need to go the swap flow (while running in tmp and therefore having the initial app directory unlocked for writing)
  - `swap()` - backs up actual version and replaces it with the new one
  - `restart( extraArgs )` - restarts the updated app from its original location
- Strategy ScriptSwap
  - `restartToSwap()` closes the app and launches the swap script, which launches the application when it's done


## Distribution

- Run release server (see [example](example/server/README.md))
- Add to your client manifest ([package.json](example/client-strategy-app/package.json)) field `manifestUrl` pointing at release server
- Package your app by using [nwjs-builder](https://github.com/evshiron/nwjs-builder) (see [example](example/client-strategy-app/README.md))
- Update the contents of `packages` field in release server manifest (e.g. by running  `node update.js`)
- Update `version` field in release server manifest
- Launch your app and observe it's auto-updating

## Examples

- [Client/Strategy AppSwap](example/client-strategy-app/index.html)
- [Client/Strategy ScriptSwap](example/client-strategy-script/index.html)
- [Server](example/server/README.md)

## API

### Constructor
```
new AutoUpdate( manifest, options );
```

**Params**
- `manifest` - e.g. `require( "./package.json" )`
- `options.strategy` - (OPTIONAL) can be `ScriptSwap` or `AppSwap`. By default `AppSwap`
- `options.executable` - (OPTIONAL) executable if it doesn't match project name
- `options.backupDir` - (OPTIONAL) directory to backup. By default it's <project_name>.bak next to app directory
- `options.execDir` - (OPTIONAL) app directory.  By default it's extracted from `process.execPath` (nwjs-builder bundles the app into self-extractable and `process.cwd()` is not a reliable source). Yet on a Mac `process.execPath` contains the full path to the executable within MacOS bundle. So you rather use this option to set the app path directly.
- `options.updateDir` - (OPTIONAL) temporary directory where the downloaded package gets extracted. By default /tmp/nw-autoupdater
- `options.logPath` - (OPTIONAL) the full path to the log file. By default `nw.App.dataPath + "/nw-autoupdater.log"`: Windows: %LOCALAPPDATA%/<project_name>; Linux: ~/.config/<project_name>; OSX: ~/Library/Application Support/<project_name>
- `options.verbose` - (OPTIONAL) when `true` swap script reports verbose in the log file. By default `false`
- `options.swapScript` - (OPTIONAL) you custom swap script content (NOTE: available only for ScriptSwap strategy)
- `options.accumulativeBackup` - (OPTIONAL) when `true` for every backup creates a new folder. By default `false`

### Writing custom swap script

You can define with `options.swapScript` you own custom swap script:
```
 const updater = new AutoUpdater( require( "./package.json" ), {
          strategy: "ScriptSwap",
          swapScript: `
BASH/BAT SCRIPT CONTENT
`
      });
```

By default on Linux/MacIO the following script is used:
```
rsync -a\${VERBOSE} --delete \${APP_PATH}/. \${BAK_PATH}/
rsync -a\${VERBOSE} --delete \${UPDATE_PATH}/. \${APP_PATH}/
```

where the variables are populated from ARGV:

- VERBOSE - "v" or ""
- APP_PATH - application home directory
- BAK_PATH - backup directory
- UPDATE_PATH - update directory

For example, if you have for package not the entire NW.js application, but just HTML5 project, you set up the following script:
```
rsync -a\${VERBOSE} --delete \${APP_PATH}/. \${BAK_PATH}/
rsync -a\${VERBOSE} \${UPDATE_PATH}/. \${APP_PATH}/package
```
So it backups the project, but copies extracted packaged into `package` subfolder in application home directory



### readRemoteManifest
Reads package.json of the release server
```
const rManifest = await updater.readRemoteManifest();
```
**Returns**: `Promise<manifest: Object>`

### checkNewVersion
Check if the release server has newer app version
```
const needsUpdate = await updater.checkNewVersion( rManifest );
```
**Params**
- `rManifest` - manifest of the release server

**Returns**: `Promise<needsUpdate: boolean>`


### download
Download last available update to the temp directory
```
const updateFile = await updater.download( rManifest, { debounceTime: 100 });
```
**Params**
- `rManifest` - manifest of the release server
- `options.debounceTime` - (OPTIONAL) debounce time in milliseconds

**Returns**: `Promise<filepath: string>`

### unpack
Unpack downloaded update
```
const extractDir = await updater.unpack( updateFile, { debounceTime: 100 } );
```
**Params**
- `updateFile` - path to downloaded update
- `options.debounceTime` - (OPTIONAL) debounce time in milliseconds

**Returns**: `Promise<directory: string>`

### restartToSwap
Close this version of app and start the downloaded one with --swap param
```
await updater.restartToSwap();
```

**Params**
- `extraArgs` - (OPTIONAL) Extra arguments to be passed to the newly started app

**Returns**: `Promise`


## Events

### download
Subscribe on download progress event
```
updater.on( "download", ( downloadSize, totalSize ) => {
  console.log( "download progress", Math.floor( downloadSize / totalSize * 100 ), "%" );
});
```

### install
Subscribe on install progress event
```
updater.on( "install", ( installFiles, totalFiles ) => {
  console.log( "install progress", Math.floor( installFiles / totalFiles * 100 ), "%" );
});
```


## Extra Methods required for Strategy AppSwap

### isSwapRequest
Checks if the app launched for swap
```
const needsSwap = updater.isSwapRequest();
```
**Returns**: `boolean`

### swap
Backs up current version of the app and replaces it with the downloaded version
```
await updater.swap();
```

**Returns**: `Promise`

### restart
Restarts the updated app
```
await updater.restart();
```

**Params**
- `extraArgs` - (OPTIONAL) Extra arguments to be passed to the newly started app

**Returns**: `Promise`



## Contributing

`nw-autoupdater` welcomes maintainers. There is plenty of work to do. No big commitment required,
if all you do is review a single Pull Request, you are a maintainer.


### How to check changes

```
# Clone the git repo
git clone git@github.com:dsheiko/nw-autoupdater.git

# Navigate to the newly created directory
cd nw-autoupdater

# Switch the branch if needed
# Make changes in the code
# Bundle the package
npm pack

# You'will get a new file like `nw-autoupdater-1.1.11.tgz`
# Switch a client example
cd example/client-strategy-script/

# Install the updated package
npm i ../../nw-autoupdater-1.1.11.tgz

# Package demo app
npm run package

# Extract demo app package in a temp directory
unzip ../server/releases/nw-autoupdater-demo-r1.0.0-linux-x64.zip -d /tmp/Sandbox/

# Switch to release server example
cd ../server/
# Make sure dependencies up to date
npm i
# Update releases manifest
npm run update
# Start the server
npm start

# Now start the demo app from your temp /tmp/Sandbox/
/tmp/Sandbox/nw-autoupdater-demo

# It says:
#  Application ver. 1.0.0
#  App is up to date...

# Switch back to demo app and update its version
cd ../client-strategy-script/
npm version patch
npm run package

# Back to the server to update manifest
cd ../server/
npm run update
npm start

# When starting the built app it updates
/tmp/Sandbox/nw-autoupdater-demo

```

<hr />
<a href="https://www.packtpub.com/web-development/cross-platform-desktop-application-development-electron-node-nwjs-and-react"><img align="left" src="book-cover.png"></a>
My book:
<h4>Cross-platform Desktop Application Development: Electron, Node, NW.js, and React</h4>
<p><i>I split the book in four tutorials, starting with basics and advancing progressively though more and more complex aspects. So the first part guides on creating a file-explorer built with pure JavaScript and NW.js/Node.js. The second part is about creating a chat with Electron, React and PhotonKit. The third part is about screen capturer made with NW.js, React/Redux and Material UI. The last part guides on creating RSS aggregator with Electron, React, Redux and TypeScript. </i></p>
