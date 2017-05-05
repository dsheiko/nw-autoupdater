# Release Server Example

It's a static server that keeps manifest and last app releases.
Releases of nwjs app are built with 'nw-builder' (as example), the structure of builds is next:
* macos - %APPNAME%.app (compressed *.app file for release);
* win/linux - %FOLDER_NAME% with binary and other necessary files inside (compressed all files inside this folder for release);

Updater during update process will create backup of your current application, for macos in the same folder %APPNAME%.app.bak will be created, on win/linux it will create %FOLDER_NAME%.bak in the folder with application folder %FOLDER_NAME%.

## package.json
```
{
  version: "1.0.1", // nw-autoupdater compares this version with the local app manifest
  packages: { // map of available releases
    "linux64": {
      "url": "http://localhost:8080/releases/nw-autoupdater-demo-linux-x64.zip",
      "size": 102680557
    },
    "win64": {
      "url": "http://localhost:8080/releases/nw-autoupdater-demo-win-x64.zip",
      "size": 102680557
    },
    "mac64": {
      "url": "http://localhost:8080/releases/nw-autoupdater-demo-mac-x64.tar.gz",
      "size": 102680557
    }
  }
}
```

## Commands

### Run server
```
npm start
```
Besides serving static files (releases) the server watches for changes in releases directory.
When new file arrives, it tries automatically update `package.json`

### Update `packages` field of the manifest based on actual content of `release directory
```
npm run update
```
