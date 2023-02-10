# Script Kit Extension

## Features

- Run the currently open file in Script Kit.
- Outputs the current state of VS Code to ~/.kit/db/vscode.json

## Shortcuts

`cmd+option+;` - Run the currently open file in Script Kit.

## OS Behaviors

### Mac and Linux

Will send the filePath to a unix socket on `~/.kit/kar` to forward to Kit.app.

### Windows

Will write the filePath to `~/.kit/run.txt`. Kit.app watches `run.txt` for changes and will run the file when it changes.

## Authors

- [Matt Pocock](https://github.com/mattpocock)
- [John Lindquist](https://github.com/johnlindquist)