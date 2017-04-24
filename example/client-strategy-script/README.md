# App Example

# What do we do to autoupdate ([see example](index.html))
- `readRemoteManifest` reads manifest from the remote release server
- `checkNewVersion( rManifest )` checks if the version in the remote manifest greater than one of the local manifest
- If the remote manifest doesn't have newer version, skips the update flow
  - We subscribe for `download` events
  - We subscribe for `install` events
- `download( rManifest )` downloads the latest available release matching the host platform (according to the `packages` map of the remote manifest)
- `unpack( updateFile )` unpacks the release archive (`zip` or `tar.gz`) in a temporary directory
- `restartToSwap()` closes the app and launches the swap script, which launches the application when it's done


## Commands

### Launch the app
```
npm start
```

### Package the app
```
npm run package
```

### Increment version and package
```
npm version patch
```