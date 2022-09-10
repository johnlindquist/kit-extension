/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { exec } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { commands, ExtensionContext, window } from "vscode";

interface VSCodePreservedInfo {
  activeTextEditorFilePath: string | null;
  activeTextEditorDir: string | null;
  openTextEditorWindows: string[];
}

const savedInfo: VSCodePreservedInfo = {
  activeTextEditorFilePath: null,
  activeTextEditorDir: null,
  openTextEditorWindows: [],
};

const saveActiveInfoToFile = () => {
  const filePath = path.join(os.homedir(), ".kit", "vscode.json");

  fs.writeFileSync(filePath, JSON.stringify(savedInfo, null, 2));
};

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(() => {
      if (window.activeTextEditor) {
        const { document } = window.activeTextEditor;
        savedInfo.activeTextEditorFilePath = document.fileName;
        savedInfo.activeTextEditorDir = path.dirname(document.fileName);
      } else {
        savedInfo.activeTextEditorFilePath = null;

        savedInfo.activeTextEditorDir = null;
      }

      saveActiveInfoToFile();
    }),
    window.onDidChangeVisibleTextEditors(() => {
      savedInfo.openTextEditorWindows = window.visibleTextEditors.map(
        (editor) => editor.document.uri.fsPath,
      );

      saveActiveInfoToFile();
    }),
  );

  context.subscriptions.push(
    commands.registerCommand("kit.run", () => {
      if (window.activeTextEditor) {
        const currentlyOpenTabfilePath =
          window.activeTextEditor.document.fileName;
        exec(
          `${path.resolve(
            os.homedir(),
            ".kit",
            "kar",
          )} ${currentlyOpenTabfilePath}`,
        );
      }
    }),
  );
}
