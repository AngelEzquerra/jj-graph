<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: Apache-2.0
-->

<script setup lang="ts">

import * as api from '@common/api'
import { computed, effect, onMounted, onUnmounted, provide, ref, useTemplateRef, watch } from 'vue';
import GraphContextMenu from '@common-client/components/GraphContextMenu.vue';
import IdPrefix from '@common-client/components/IdPrefix.vue';
import Graph, { type GraphMode } from '@common-client/components/Graph.vue';
import DevTestOptions from '@common-client/components/DevTestOptions.vue';
import { useDevTestOptionsStore } from '@common-client/stores/devTestOptions';
import { useRepoSourceStore, generateInlineGraph } from '@common-client/stores/repoSource';
import { storeToRefs } from 'pinia';
import { GRAPH_ACTIONS_INJECTION_KEY } from '@common-client/providers/graph-actions-provider';
import { refDebounced } from '@vueuse/core';
import { LoaderCircle } from 'lucide-vue-next';
import type { JJCommitGraphCommitNode } from '@common/jj-graph-parser/commit-graph-parser';

type NodeId = number
type GraphNode<NodeData> = {
  id: NodeId
  data?: NodeData
  glyph?: string
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

const latestOperationId = ref<string>()

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
      refreshLatestOperationId()
      break;
    }
    case api.REQUEST_OPERATION_LATEST_ID: {
      latestOperationId.value = message.response.id
      break;
    }
  }
})

watch(latestOperationId, () => refreshLog())

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

function refreshLatestOperationId() {
  const gs = graphSource.value
  const kgs = knownGraphSources.value
  if (gs?.type === 'repo' && kgs.repo.some(x => x.value === gs.value)) {
    vscode.postMessage(api.operationLatestId(gs.value))
  }
}

effect(refreshLog)
effect(refreshLatestOperationId)

let latestOperationIdWatcherHandle: NodeJS.Timeout

onMounted(() => {
  latestOperationIdWatcherHandle = setInterval(refreshLatestOperationId, 1000)
})

onUnmounted(() => {
  clearInterval(latestOperationIdWatcherHandle)
})

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
  newBetween(beforeChangeIds: string[], afterChangeIds: string[]) {
    postIfJJRepo('newBetween', (repo) => api.newChange(repo, false, undefined, afterChangeIds.map(x => `change_id(${x})`).join(' | '), beforeChangeIds.map(x => `change_id(${x})`).join(' | '), undefined))
  },
  newAfter(changeIds: string[]) {
    postIfJJRepo('newAfter', (repo) => api.newChange(repo, false, undefined, changeIds.map(x => `change_id(${x})`).join(' | '), undefined, undefined))
  },
  newBefore(changeIds: string[]) {
    postIfJJRepo('newBefore', (repo) => api.newChange(repo, false, undefined, undefined, changeIds.map(x => `change_id(${x})`).join(' | '), undefined))
  },
  newFrom(changeIds: string[]) {
    postIfJJRepo('newFrom', (repo) => api.newChange(repo, true, changeIds.map(x => `change_id(${x})`).join(' | '), undefined, undefined, undefined))
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
  abandon(changeIds: string[]) {
    postIfJJRepo('abandon', (repo) => api.abandon(repo, changeIds.map(x => `change_id(${x})`).join(' | '), true, false))
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
    const commits = await promptUserForCommitSelection({ multiple: false })
    if (!commits || commits.length < 1) {
      return
    }
    const commit = commits[0]!
    postIfJJRepo('bookmarkSet', (repo) => api.bookmarkSet(repo, name, commit.changeId, true))
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

const graphMode = ref<GraphMode>('normal')

let commitSelectionCb: ((commits: JJCommitGraphCommitNode[]) => void) | undefined

async function promptUserForCommitSelection(opts?: { multiple?: boolean }): Promise<JJCommitGraphCommitNode[]> {
  graphMode.value = opts?.multiple ? 'modalSelectMultiple' : 'modalSelectSingle'
  return new Promise<JJCommitGraphCommitNode[]>((resolve, reject) => {
    if (commitSelectionCb) {
      commitSelectionCb([])
    }
    commitSelectionCb = (commits) => {
      resolve(commits)
      commitSelectionCb = undefined
      graphMode.value = 'normal'
    }
  })
}

const selectedCommits = ref<JJCommitGraphCommitNode[]>([])

function setSelectedCommits(data: JJCommitGraphCommitNode[]) {
  selectedCommits.value = data
}

function handleSelectionSubmit() {
  if (commitSelectionCb) {
    commitSelectionCb(selectedCommits.value)
  }
}

function handleSelectionCancel() {
  if (commitSelectionCb) {
    commitSelectionCb([])
  }
}

</script>

<template>
  <UApp :toaster="{ position: 'top-center', duration: 1200, }">
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
    <div class="flex flex-row-reverse mx-4 my-2">
      <UPopover>
        <UButton icon="i-lucide-bolt" color="neutral" variant="ghost" />
        <template #content>
          <div class="p-2">
            <DevTestOptions />
          </div>
        </template>
      </UPopover>
      <UColorModeButton />
      <div class="grow"></div>
      <div class="flex gap-2 items-center select-none">
        <pre>Current Operation:</pre><IdPrefix :id="latestOperationId ?? ''" :prefix="0" :prefix-min="12" />
      </div>
    </div>
    <div class="flex m-4">
      <UInput v-model="revsetInput" placeholder="Revset" :loading="revsetInputLoading" icon="i-lucide-list-filter"  />
    </div>
    <div v-if="graphMode !== 'normal'">
      <!-- <label>Mode: {{ graphMode }}</label> -->
      <div class="flex gap-2">
        <label>Selection</label>
        <span v-for="s in selectedCommits"><IdPrefix :id="s.changeId" :prefix="s.changeIdPrefixLen" :prefix-min="8" /></span>
      </div>
      <div class="flex gap-2">
        <button @click="handleSelectionSubmit">Submit</button>
        <button @click="handleSelectionCancel">Cancel</button>
      </div>
    </div>
    <GraphContextMenu :disabled="graphMode !== 'normal'">
      <Graph :key="graphId" :commits="logNodes" :opts="opts" :mode="graphMode" @commit-selection="setSelectedCommits" />
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
