<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: Apache-2.0
-->

<script setup lang="ts">

import * as api from '@common/api'

window.addEventListener('message', event => {
  console.log('Message Handled', event)

  const message = event.data;
  const response = message.response;

  switch (message.request) {
    case api.REQUEST_LOG:
      console.log(response)
      break;
  }
})

const vscode = window.acquireVsCodeApi()
vscode.postMessage(api.log(import.meta.env.JJ_REPO_PATH, "all()"))

</script>

<template>
</template>

<style scoped>
</style>
