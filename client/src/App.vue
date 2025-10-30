<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: Apache-2.0
-->

<script setup lang="ts">

import * as api from '@common/api'
import { effect, provide, ref, useTemplateRef } from 'vue';
import Graph from '@common-client/components/Graph.vue';
import DevTestOptions from '@common-client/components/DevTestOptions.vue';
import { useDevTestOptionsStore } from '@common-client/stores/devTestOptions';
import { useRepoSourceStore, generateInlineGraph } from '@common-client/stores/repoSource';
import { storeToRefs } from 'pinia';
import { GRAPH_ACTIONS_INJECTION_KEY } from '@common-client/providers/graph-actions-provider';

type NodeId = number
type GraphNode<NodeData> = {
  id: NodeId
  data?: NodeData
  parents: NodeId[]
  children: NodeId[]
}

const logNodes = ref<GraphNode<any>[]>([])
const graphId = ref<string>(crypto.randomUUID())

const devTestOptionsStore = useDevTestOptionsStore()
const { opts } = storeToRefs(devTestOptionsStore)
const repoSourceStore = useRepoSourceStore()
const { graphSource, knownGraphSources } = storeToRefs(repoSourceStore)
const { updateRepoList } = repoSourceStore

const loadingDialog = useTemplateRef('loadingDialog')

window.addEventListener('message', event => {
  console.log('Message Handled', event)

  const message = event.data as api.JJApiResponse;

  switch (message.type) {
    case api.REQUEST_LIST_REPOS: {
      updateRepoList(message.response.repoPaths)
      break;
    }
    case api.REQUEST_LOG: {
      logNodes.value = message.response.nodes
      graphId.value = crypto.randomUUID()
      loadingDialog.value?.close()
      break;
    }
  }
})

const vscode = window.acquireVsCodeApi()
vscode.postMessage(api.listRepos())

effect(() => {
  const gs = graphSource.value
  const kgs = knownGraphSources.value
  console.log('doing effect with gs', gs)
  if (gs) {
    if (gs.type === 'repo' && kgs.repo.some(x => x.value === gs.value)) {
      loadingDialog.value?.showModal()
      vscode.postMessage(api.log(gs.value, undefined))
    } else {
      logNodes.value = generateInlineGraph(gs.value).nodes
    }
  }
})

function handleViewDiff(commitId: string, path: string) {
  const gs = graphSource.value
  console.log('handleViewDiff', commitId, path)
  if (gs?.type === 'repo') {
    const req = api.viewDiff(gs.value, commitId, path)
    console.log('req', req)
    vscode.postMessage(req)
  } else {
    console.warn("Trying to view diff of inline-generated graph")
  }
}

provide(GRAPH_ACTIONS_INJECTION_KEY, {
  viewDiff: handleViewDiff,
})

</script>

<template>
  <dialog class="modal-dialog" ref="loadingDialog">
    <div>Loading</div>
  </dialog>
  <DevTestOptions />
  <Graph :key="graphId" :commits="logNodes" :opts="opts" />
</template>

<style scoped>

.modal-dialog {
  margin: 0 auto;
  place-items: center;
}

.modal-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

</style>
