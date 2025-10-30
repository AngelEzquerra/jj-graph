// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: Apache-2.0

import * as vscode from 'vscode';
import * as path from "path";
import { handleRequest } from "@common-server/index";
import { type IntegrationProvider } from '@common-server/integration';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "vscode-jj-graph" activated');

  const ip: IntegrationProvider = {
    listRepos() {
      // Return workspace folder paths
      return (
        (vscode.workspace.workspaceFolders ?? [])
          .map(x => x.uri)
          .filter(x => x.scheme === 'file')
          .map(x => x.fsPath)
      )
    },
  }

  context.subscriptions.push(vscode.commands.registerCommand(
    'vscode-jj-graph.openNewTab',
    () => {
      const panel = prepareWebView(context);
      panel.webview.onDidReceiveMessage(
          async (message) => {
              const response = await handleRequest(message, ip)
              panel.webview.postMessage(response)
          },
          undefined,
          context.subscriptions
      );
    }
  ));
}

// This method is called when your extension is deactivated
export function deactivate() {}

function prepareWebView(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        "vscode-jj-graph-webview",
        "JJ Graph",
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(
                    path.join(context.extensionPath, "dist-webview", "assets")
                ),
            ],
        }
    );

    const dependencyNameList: string[] = [
        "index.css",
        "index.js",
    ];
    const dependencyList: vscode.Uri[] = dependencyNameList.map((item) =>
        panel.webview.asWebviewUri(
            vscode.Uri.file(
                path.join(context.extensionPath, "dist-webview", "assets", item)
            )
        )
    );
    const html = `<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JJ Graph</title>
    <script type="module" crossorigin src="${dependencyList[1]}"></script>
    <link rel="stylesheet" crossorigin href="${dependencyList[0]}">
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`;
    panel.webview.html = html;
    return panel;
}
