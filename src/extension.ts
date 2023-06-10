/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { exec } from "child_process"
import * as fs from "fs"
import { readFile, writeFile } from "fs/promises"
import * as os from "os"
import * as path from "path"
import { commands, ExtensionContext, window } from "vscode"

interface VSCodePreservedInfo {
  activeTextEditorFilePath: string | null
  activeTextEditorDir: string | null
  openTextEditorWindows: string[]
}

const savedInfo: VSCodePreservedInfo = {
  activeTextEditorFilePath: null,
  activeTextEditorDir: null,
  openTextEditorWindows: [],
}

const saveActiveInfoToFile = () => {
  const filePath = path.join(os.homedir(), ".kit", "db", "vscode.json")

  fs.writeFileSync(filePath, JSON.stringify(savedInfo, null, 2))
}

const updateSavedInfo = () => {
  if (window.activeTextEditor) {
    const { document } = window.activeTextEditor
    savedInfo.activeTextEditorFilePath = document.fileName
    savedInfo.activeTextEditorDir = path.dirname(document.fileName)
  } else {
    savedInfo.activeTextEditorFilePath = null
    savedInfo.activeTextEditorDir = null
  }

  saveActiveInfoToFile()
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(() => {
      updateSavedInfo()
    }),
    window.onDidChangeVisibleTextEditors(() => {
      savedInfo.openTextEditorWindows = window.visibleTextEditors.map(editor => editor.document.uri.fsPath)
      updateSavedInfo()
    }),
    // Listen for text editor focus
    window.onDidChangeWindowState(e => {
      if (e.focused) {
        updateSavedInfo()
      }
    })
  )

  context.subscriptions.push(
    commands.registerCommand("kit.run", async () => {
      // TODO: Save the active file before doing anything else
      // TODO: Save the active file before doing anything else
      const activeEditor = window.activeTextEditor
      if (activeEditor) {
        const success = await activeEditor.document.save()
        if (!success) {
          window.showErrorMessage(`Failed to save the active file.`)
          return
        }
      } else {
        window.showErrorMessage(`Failed to run script. No file is open.`)
        return
      }

      // TODO: Setup a channel between the extension and the app for more reliable communication
      // TEMP: wait 200 ms for the file to save
      await new Promise(resolve => setTimeout(resolve, 200))

      if (window.activeTextEditor) {
        // if windows
        if (process.platform === "win32") {
          // attempt to write to the run.txt file
          try {
            const currentlyOpenTabURI = window.activeTextEditor.document.uri.fsPath
            const currentlyOpenTabfilePath = currentlyOpenTabURI.replace("file://", "")

            const contents = await readFile(currentlyOpenTabfilePath, "utf8")
            // Read args from metadata like //Args: one two three
            const argsMetadata = contents.match(/(?<=\/\/\s*Args:\s*)(.*)/gm)
            let fileArgs = ``
            if (argsMetadata) {
              fileArgs = ` ${argsMetadata?.[0]?.trim()}`
            }

            const runFilePath = path.resolve(os.homedir(), ".kit", "run.txt")
            console.log(`Running ${currentlyOpenTabfilePath} in Kit.app using ${runFilePath}`)
            const runFileContents = `${currentlyOpenTabfilePath}${fileArgs}`.trim()
            await writeFile(runFilePath, runFileContents)
          } catch (error) {
            console.log(error)
          }
        } else {
          const currentlyOpenTabfilePath = window.activeTextEditor.document.fileName
          exec(`${path.resolve(os.homedir(), ".kit", "kar")} ${currentlyOpenTabfilePath}`)
        }
      } else {
        window.showErrorMessage(`Failed to run script. No file is open.`)
      }
    })
  )
}
