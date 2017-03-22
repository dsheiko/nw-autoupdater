# App Example

# What JavaScript in index.html does
- It reads manifest from the remote release server
- It checks if the version in the remote manifest greater than one of the local manifest it starts the update flow
- It downloads the latest available version matching the host platform (according to the `packages` map of the remote manifest)
- It unpacks it in a temporary directory
- It closes the app and launches it from the downloaded release (from temporary directory)
- From the downloaded release it backs up actual version and replace it with the new one
- It restarts the app from its original location


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