# Server
- from package.json refers not to archives but to manifests
- release manifest includes all the relative paths to files and SHA1 hashes
- server gets UI server-side React-Redux based on Material UI
- server on releases repo changes (directly upload or via UI Uploader) packages in repo
  - unpacks archive
  - calculates SHA1 for every file
  - writes down package manifest
- server when client sends local manifest compares it to remote one, if any SHA1 does not match emits update
- new structure platform/release-tag/unpacked

# Client
- on start up client updates release manifest by going through dir and calculating all SHA1
- it compares generated manifest with the latest remote one
- if any differences, request update
- receives update as tar.gz
- unpacks in temp
- checks with SHA1 of the remote manifest
- if fine proceed for update..


# Signed releases
- generate PGP key pair
- every client gets public key
- the server gets private key
- user cleartext/armored message to sign every release
- on the client verify the signature


https://www.npmjs.com/package/openpgp
