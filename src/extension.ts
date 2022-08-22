/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, commands, ExtensionContext } from "vscode"
import * as path from "path"
import * as os from "os"
import { exec } from "child_process"

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("kit.run", async () => {
      if (window.activeTextEditor) {
        const currentlyOpenTabfilePath = window.activeTextEditor.document.fileName
        exec(`${path.resolve(os.homedir(), ".kit", "kar")} ${currentlyOpenTabfilePath}`)
      }
    })
  )
}
