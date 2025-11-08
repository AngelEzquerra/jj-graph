// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: Apache-2.0

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import { createVsCodeMockApi } from './vscode-mock-api'
import { createMemoryHistory, createRouter } from 'vue-router'

createVsCodeMockApi()

const app = createApp(App)

app.use(ui)
app.use(createRouter({ history: createMemoryHistory(), routes: [] }))
app.use(createPinia())

app.mount('#app')
