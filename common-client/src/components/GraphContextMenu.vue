<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">
import { computed, inject, provide, ref } from 'vue';
import type { ContextMenuItem } from '@nuxt/ui';
import { GRAPH_INTERACTION_CTX_IK } from '@common-client/providers/graph-interaction-ctx-provider';
import { GRAPH_ACTIONS_INJECTION_KEY } from '@common-client/providers/graph-actions-provider';
import type { JJCommitGraphCommitNode } from '@common/jj-graph-parser/commit-graph-parser';

type ThisComponentProps = {
  disabled: boolean
}

const { disabled } = defineProps<ThisComponentProps>()

const commitDataContext = ref<JJCommitGraphCommitNode[]>([])
const bookmarkContext = ref<string>()
const beforeCommitContext = ref<JJCommitGraphCommitNode>()
const afterCommitContext = ref<JJCommitGraphCommitNode>()

function setCommitDataContext(commitData: JJCommitGraphCommitNode[]) {
  commitDataContext.value = commitData
}

function setBookmarkContext(bookmark?: string) {
  bookmarkContext.value = bookmark
}

function setBeforeAfterContext(data?: { before: JJCommitGraphCommitNode, after: JJCommitGraphCommitNode }) {
  beforeCommitContext.value = data?.before
  afterCommitContext.value = data?.after
}

const singleCommitContext = computed(() => {
  const commits = commitDataContext.value
  if (commits && commits.length === 1) {
    return commits[0]!
  }
  return undefined
})

const multipleCommitContext = computed(() => {
  const commits = commitDataContext.value
  if (commits && commits.length > 1) {
    return commits
  }
  return undefined
})

provide(GRAPH_INTERACTION_CTX_IK, {
  setCommitDataContext,
  setBookmarkContext,
  setBeforeAfterContext,
})

const actions = inject(GRAPH_ACTIONS_INJECTION_KEY)!

const multipleCommitContextItems: ContextMenuItem[] = [
  {
    label: 'New (Merge)',
    icon: 'i-lucide-plus',
    onSelect() {
      const commitData = multipleCommitContext.value
      if (commitData) {
        actions.newFrom(commitData.map(x => x.changeId))
      }
    }
  },
  {
    label: 'Insert After (Merge)',
    icon: 'i-lucide-plus',
    onSelect() {
      const commitData = multipleCommitContext.value
      if (commitData) {
        actions.newAfter(commitData.map(x => x.changeId))
      }
    }
  },
  {
    label: 'Insert Before (Merge)',
    icon: 'i-lucide-plus',
    onSelect() {
      const commitData = multipleCommitContext.value
      if (commitData) {
        actions.newBefore(commitData.map(x => x.changeId))
      }
    }
  },
  {
    label: 'Abandon',
    icon: 'i-lucide-trash',
    onSelect() {
      const commitData = multipleCommitContext.value
      if (commitData) {
        actions.abandon(commitData.map(x => x.changeId))
      }
    }
  },
]

const singleCommitContextItems: ContextMenuItem[] = [
  {
    label: 'New',
    icon: 'i-lucide-plus',
    onSelect() {
      const commitData = singleCommitContext.value
      if (commitData) {
        actions.newFrom([commitData.changeId])
      }
    }
  },
  {
    label: 'Insert After',
    icon: 'i-lucide-plus',
    onSelect() {
      const commitData = singleCommitContext.value
      if (commitData) {
        actions.newAfter([commitData.changeId])
      }
    }
  },
  {
    label: 'Insert Before',
    icon: 'i-lucide-plus',
    onSelect() {
      const commitData = singleCommitContext.value
      if (commitData) {
        actions.newBefore([commitData.changeId])
      }
    }
  },
  {
    label: 'Describe...',
    icon: 'i-lucide-pencil',
    onSelect() {
      const commitData = singleCommitContext.value
      if (commitData) {
        actions.describe(commitData.changeId, commitData.description)
      }
    }
  },
  {
    label: 'Edit',
    icon: 'i-lucide-log-in',
    onSelect() {
      const commitData = singleCommitContext.value
      if (commitData) {
        actions.edit(commitData.changeId)
      }
    }
  },
  {
    label: 'Abandon',
    icon: 'i-lucide-trash',
    onSelect() {
      const commitData = singleCommitContext.value
      if (commitData) {
        actions.abandon([commitData.changeId])
      }
    }
  },
  {
    label: 'Create Bookmark...',
    icon: 'i-lucide-bookmark-plus',
    onSelect() {
      const commitData = singleCommitContext.value
      if (commitData) {
        actions.bookmarkCreate(commitData.changeId)
      }
    }
  },
]

const bookmarkContextItems: ContextMenuItem[] = [
  {
    label: 'Move...',
    icon: 'i-lucide-move-up-left',
    onSelect() {
      const bookmark = bookmarkContext.value
      if (bookmark) {
        actions.bookmarkSet(bookmark)
      }
    }
  },
  {
    label: 'Rename...',
    icon: 'i-lucide-pencil',
    onSelect() {
      const bookmark = bookmarkContext.value
      if (bookmark) {
        actions.bookmarkRename(bookmark)
      }
    }
  },
  {
    label: 'Forget',
    icon: 'i-lucide-bookmark-minus',
    onSelect() {
      const bookmark = bookmarkContext.value
      if (bookmark) {
        actions.bookmarkForget(bookmark, false)
      }
    }
  },
  {
    label: 'Delete',
    icon: 'i-lucide-bookmark-x',
    onSelect() {
      const bookmark = bookmarkContext.value
      if (bookmark) {
        actions.bookmarkDelete(bookmark)
      }
    }
  },
]

const beforeAfterContextItems: ContextMenuItem[] = [
  {
    label: 'New Between',
    icon: 'i-lucide-plus',
    onSelect() {
      const beforeCommit = beforeCommitContext.value
      const afterCommit = afterCommitContext.value
      if (beforeCommit && afterCommit) {
        actions.newBetween([beforeCommit.changeId], [afterCommit.changeId])
      }
    }
  },
]

const emptyContextItems: ContextMenuItem[][] = [[
  {
    label: 'No Actions Available',
    type: 'label'
  }
]]

const menuItems = computed<ContextMenuItem[][]>(() => {
  const singleCommitCtx = singleCommitContext.value
  const multipleCommitCtx = multipleCommitContext.value
  const bookmarkCtx = bookmarkContext.value
  const beforeCommitCtx = beforeCommitContext.value
  const afterCommitCtx = afterCommitContext.value

  const ctxItems: ContextMenuItem[][] = []

  if (beforeCommitCtx && afterCommitCtx) {
    ctxItems.push(beforeAfterContextItems)
  }

  if (multipleCommitCtx) {
    ctxItems.push(multipleCommitContextItems)
  } else if (singleCommitCtx) {
    ctxItems.push(singleCommitContextItems)
  }

  if (bookmarkCtx) {
    ctxItems.push(bookmarkContextItems)
  }

  if (ctxItems.length === 0) {
    ctxItems.push(emptyContextItems)
  }

  return ctxItems
})

function onOpenChange(open: boolean) {
  if (!open) {
    setCommitDataContext([])
    setBookmarkContext(undefined)
    setBeforeAfterContext(undefined)
  }
}
</script>

<template>
  <UContextMenu :items="menuItems" @update:open="onOpenChange" :disabled="disabled">
    <slot />
  </UContextMenu>
</template>
