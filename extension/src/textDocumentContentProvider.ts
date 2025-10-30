// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: Apache-2.0

import * as vscode from 'vscode'
import { toJJUri, type JJUri } from './uri'
import { JJCbDiff } from '@common-server/jj'

export class JJTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
  private readonly _jjCbDiff: JJCbDiff

  constructor(readonly jjCbPath: string) {
    this._jjCbDiff = new JJCbDiff(this.jjCbPath)
  }

  async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
    const jjUri = toJJUri(uri)
    if (jjUri.type === 'diff') {
      return await this._jjCbDiff.getContent(jjUri.repoPath, jjUri.commitId, jjUri.side, jjUri.filePath)
    }
    return ''
  }
}
