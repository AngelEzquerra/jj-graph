// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: Apache-2.0

import type {  WebviewApi } from 'vscode-webview'

const mockStateLocalStorageKey = 'jj-graph-state'
const mockApiPort = 3000

function acquireVsCodeApiMock<StateType>(): WebviewApi<StateType> {
  return {
    async postMessage(message: unknown) {
      const response = await fetch(`http://localhost:${mockApiPort}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      const jsonResponse = await response.json()

      window.postMessage(jsonResponse)
    },

    getState(): StateType | undefined {
      return JSON.parse(window.localStorage.getItem(mockStateLocalStorageKey) ?? 'undefined') as StateType
    },

    setState<T extends StateType | undefined>(newState: T): T {
      window.localStorage.setItem(mockStateLocalStorageKey, JSON.stringify(newState))
      return newState
    }
  }
}

export function createVsCodeMockApi() {
  if (window && !window.acquireVsCodeApi) {
    window.acquireVsCodeApi = acquireVsCodeApiMock
  }
}

