# Release Server Example

It's a static server that keeps manifest and last app releases

## package.json
```
{
  version: "1.0.1", // nw-autoupdater compares this version with the local app manifest
  packages: { // map of available releases
    "linux64": {
      "url": "http://localhost:8080/releases/nw-autoupdater-demo-linux-x64.zip",
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

### Update `packages` field of the manifest based on actual content of `release1 directory
```
npm run update
```