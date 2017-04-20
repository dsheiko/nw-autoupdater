# NW-Autoupdater v1.1
[![NPM](https://nodei.co/npm/nw-autoupdater.png)](https://nodei.co/npm/nw-autoupdater/)

Library provides low-level API to control NW.js app auto-updates. This project can be seen as a reincarnation of
[node-webkit-updater](https://github.com/edjafarov/node-webkit-updater), which is not maintained anymore.

## Features
- Node >= 7 compliant
- clean async/await syntax
- supports both Zip/Tar.Gz archives
- fires download/install progress events


![Autoupdater in action](https://github.com/dsheiko/nw-autoupdater/raw/master/nw-autoupdater.gif)

# What do we do to autoupdate ([see example](example/client/index.html))
- `readRemoteManifest` reads manifest from the remote release server
- `checkNewVersion( rManifest )` checks if the version in the remote manifest greater than one of the local manifest
- If the remote manifest doesn't have newer version, skips the update flow
  - We subscribe for `download` events
  - We subscribe for `install` events
- `download( rManifest )` downloads the latest available release matching the host platform (according to the `packages` map of the remote manifest)
- `unpack( updateFile )` unpacks the release archive (`zip` or `tar.gz`) in a temporary directory
- `restartToSwap()` closes the app and launches the swap script, which launches the application when it's done


## Distribution

- Run release server (see [example](example/server/README.md))
- Add to your client manifest ([package.json](example/client/package.json)) field `manifestUrl` pointing at release server
- Package your app by using [nwjs-builder](https://github.com/evshiron/nwjs-builder) (see [example](example/client/README.md))
- Update the contents of `packages` field in release server manifest (e.g. by running  `node update.js`)
- Update `version` field in release server manifest
- Launch your app and observe it's auto-updating

## Examples

- [Client](example/client/index.html)
- [Server](example/server/README.md)

## API

### Constructor
```
new AutoUpdate( manifest, options );
```

**Params**
- `manifest` - e.g. `require( "./package.json" )`
- `options.executable` - (OPTIONAL) executable if it doesn't match project name
- `options.backupDir` - (OPTIONAL) directory to backup. By default it's <project_name>.bak next to app directory
- `options.execDir` - (OPTIONAL) app directory.  By default it's extracted from `process.execPath` (nwjs-builder bundles the app into self-extractable and `process.cwd()` is not a reliable source). Yet on a Mac `process.execPath` contains the full path to the executable within MacOS bundle. So you rather use this option to set the app path directly.
- `options.updateDir` - (OPTIONAL) temporary directory where the downloaded package gets extracted. By default /tmp/nw-autoupdater
- `options.logDir` - (OPTIONAL) directory of log file `nw-autoupdater.log`. By default `nw.App.dataPath`: Windows: %LOCALAPPDATA%/<project_name>; Linux: ~/.config/<project_name>; OSX: ~/Library/Application Support/<project_name>
- `options.verbose` - (OPTIONAL) when `true` swap script reports verbose in the log file. By default `false`
- `options.swapScript` - (OPTIONAL) you custom swap script content

### Writing custom swap script

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

