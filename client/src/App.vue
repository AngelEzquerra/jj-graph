<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: Apache-2.0
-->

<script setup lang="ts">

import * as api from '@common/api'
import { computed, effect, provide, ref, useTemplateRef } from 'vue';
import GraphContextMenu from '@common-client/components/GraphContextMenu.vue';
import Graph from '@common-client/components/Graph.vue';
import DevTestOptions from '@common-client/components/DevTestOptions.vue';
import { useDevTestOptionsStore } from '@common-client/stores/devTestOptions';
import { useRepoSourceStore, generateInlineGraph } from '@common-client/stores/repoSource';
import { storeToRefs } from 'pinia';
import { GRAPH_ACTIONS_INJECTION_KEY } from '@common-client/providers/graph-actions-provider';
import { refDebounced } from '@vueuse/core';
import { LoaderCircle } from 'lucide-vue-next';

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
const describeInputDialog = useTemplateRef('describeInputDialog')
const describeInput = ref<string>('')

const revsetInput = ref<string>()
const revsetInputDebounced = refDebounced(revsetInput, 1500)

const revsetInputLoading = computed(() => revsetInput.value !== revsetInputDebounced.value)

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
    case api.REQUEST_EDIT:
    case api.REQUEST_ABANDON:
    case api.REQUEST_NEW_CHANGE:
    case api.REQUEST_DESCRIBE:
    case api.REQUEST_BOOKMARK_CREATE:
    case api.REQUEST_BOOKMARK_DELETE:
    case api.REQUEST_BOOKMARK_FORGET:
    case api.REQUEST_BOOKMARK_RENAME:
    case api.REQUEST_BOOKMARK_SET:
    {
      refreshLog()
      break;
    }
  }
})

const vscode = window.acquireVsCodeApi()
vscode.postMessage(api.listRepos())

function refreshLog() {
  const gs = graphSource.value
  const kgs = knownGraphSources.value
  const revset = revsetInputDebounced.value
  console.log('doing effect with gs', gs)
  if (gs) {
    if (gs.type === 'repo' && kgs.repo.some(x => x.value === gs.value)) {
      loadingDialog.value?.showModal()
      vscode.postMessage(api.log(gs.value, revset))
    } else {
      logNodes.value = generateInlineGraph(gs.value).nodes
    }
  }
}

effect(refreshLog)

function postIfJJRepo(action: string, genReq: (repoPath: string) => unknown, dontShowModal?: boolean) {
  const gs = graphSource.value
  if (gs?.type === 'repo') {
    const req = genReq(gs.value)
    console.log(action, 'req', req)
    if (!dontShowModal) {
      loadingDialog.value?.showModal()
    }
    vscode.postMessage(req)
  } else {
    console.warn(action, "Trying to run on inline-generated graph")
  }
}

provide(GRAPH_ACTIONS_INJECTION_KEY, {
  viewDiff(commitId: string, leftPath: string, rightPath: string) {
    postIfJJRepo('viewDiff', (repo) => api.viewDiff(repo, commitId, leftPath, rightPath), true)
  },
  newAfter(changeId: string) {
    postIfJJRepo('newAfter', (repo) => api.newChange(repo, false, undefined, `change_id(${changeId})`, undefined, undefined))
  },
  newBefore(changeId: string) {
    postIfJJRepo('newBefore', (repo) => api.newChange(repo, false, undefined, undefined, `change_id(${changeId})`, undefined))
  },
  newFrom(changeId: string) {
    postIfJJRepo('newFrom', (repo) => api.newChange(repo, true, `change_id(${changeId})`, undefined, undefined, undefined))
  },
  edit(changeId: string) {
    postIfJJRepo('edit', (repo) => api.edit(repo, changeId, false))
  },
  async describe(changeId: string, existingDesc: string) {
    const newDesc = await getDescribeInput(existingDesc)
    if (newDesc === existingDesc) {
      return
    }
    postIfJJRepo('describe', (repo) => api.describe(repo, changeId, newDesc))
  },
  abandon(changeId: string) {
    postIfJJRepo('abandon', (repo) => api.abandon(repo, changeId, true, false))
  },

  async bookmarkCreate(changeId: string) {
    const name = await getDescribeInput('')
    if (!name) {
      return
    }
    postIfJJRepo('bookmarkCreate', (repo) => api.bookmarkCreate(repo, changeId, name))
  },
  bookmarkDelete(name: string) {
    postIfJJRepo('bookmarkDelete', (repo) => api.bookmarkDelete(repo, name))
  },
  bookmarkForget(name: string, includeRemotes: boolean) {
    postIfJJRepo('bookmarkForget', (repo) => api.bookmarkForget(repo, name, includeRemotes))
  },
  async bookmarkRename(oldName: string) {
    const newName = await getDescribeInput(oldName)
    if (newName === oldName || !newName) {
      return
    }
    postIfJJRepo('bookmarkRename', (repo) => api.bookmarkRename(repo, oldName, newName))
  },
  async bookmarkSet(name: string) {
    console.warn("Selecting commits is still not implemented")
    // postIfJJRepo('bookmarkSet', (repo) => api.bookmarkSet(repo, name, changeId))
  }
})

let dialogCloseCb: ((dismissed: boolean) => void) | undefined

async function getDescribeInput(existingDesc: string) {
  return new Promise<string>((resolve, reject) => {
    dialogCloseCb = (dismissed) => {
      if (dismissed) {
        describeInput.value = existingDesc
      }
      resolve(describeInput.value)
      dialogCloseCb = undefined
    }
    describeInput.value = existingDesc
    console.log('existingDesc', existingDesc)
    describeInputDialog.value?.showModal()
  })
}

</script>

<template>
  <UApp>
    <dialog class="modal-dialog" ref="loadingDialog">
      <div>Loading</div>
    </dialog>
    <dialog class="modal-dialog" ref="describeInputDialog" @cancel="dialogCloseCb?.(true)" @close="dialogCloseCb?.(false)">
      <form>
        <textarea placeholder="Description" v-model="describeInput" cols="80" rows="5"></textarea>
        <div>
          <button formmethod="dialog">Submit</button>
        </div>
      </form>
    </dialog>
    <DevTestOptions />
    <div>
      <label>Revset</label>
      <span :class="{ 'hidden': !revsetInputLoading }"><LoaderCircle :size="12" class="spin" /></span>
      <input type="text" v-model="revsetInput" placeholder="Revset" :size="revsetInput?.length" class="revset-input" />
    </div>
    <GraphContextMenu>
      <Graph :key="graphId" :commits="logNodes" :opts="opts" />
    </GraphContextMenu>
  </UApp>
</template>

<style scoped>

.modal-dialog {
  margin: 0 auto;
  place-items: center;
}

.modal-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.revset-input {
  width: fit-content;
}

</style>

<style>

.hidden {
  visibility: hidden;
}

.spin {
  animation: anim-spin 1s linear infinite;
}

@keyframes anim-spin {
  0% {
      transform: rotate(0deg);
  }
  100% {
      transform: rotate(360deg);
  }
}

</style>
