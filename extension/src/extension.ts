// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: Apache-2.0

import * as vscode from 'vscode';
import * as path from "path";
import { handleRequest } from "@common-server/index";
import { type IntegrationProvider } from '@common-server/integration';
import * as jjUri from './uri'
import { JJTextDocumentContentProvider } from './textDocumentContentProvider';

type PlatformSpecificMap<T> = {
  [platform in typeof process.platform]?: {
    [arch in typeof process.arch]?: T;
  };
}

function diffTitle(leftPath: string, rightPath: string) {
  return rightPath
}

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
    async viewDiff(repoPath, commitId, leftPath, rightPath) {
      await vscode.commands.executeCommand(
        'vscode.diff',
        jjUri.fromDiffData({ type: 'diff', repoPath, commitId, filePath: leftPath, side: 'left' }),
        jjUri.fromDiffData({ type: 'diff', repoPath, commitId, filePath: rightPath, side: 'right' }),
        diffTitle(leftPath, rightPath),
        { preview: true }
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

  const jjCbPlatformPathMap: PlatformSpecificMap<string>  = {
    linux: {
      arm: "jjcb-linux-arm",
      arm64: "jjcb-linux-arm64",
      x64: "jjcb-linux-x64",
    },
    win32: {
      arm64: "jjcb-win-arm64.exe",
      x64: "jjcb-win-x64.exe",
    },
    darwin: {
      arm64: "jjcb-mac-arm64",
      x64: "jjcb-mac-x64",
    }
  }
  const jjCbPlatformPath = jjCbPlatformPathMap[process.platform]?.[process.arch];
  const jjCbPath = vscode.Uri.joinPath(context.extensionUri, `jjcb/${jjCbPlatformPath}`).fsPath

  const textDocumentContentProvider = new JJTextDocumentContentProvider(jjCbPath)
  context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(jjUri.SCHEME, textDocumentContentProvider))
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
