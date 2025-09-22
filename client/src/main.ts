// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: Apache-2.0

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createVsCodeMockApi } from './vscode-mock-api'

createVsCodeMockApi()

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
