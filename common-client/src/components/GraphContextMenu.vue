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

const commitDataContext = ref<JJCommitGraphCommitNode>()
const commitIdContext = ref<string>()
const bookmarkContext = ref<string>()
const beforeCommitIdContext = ref<string>()
const afterCommitIdContext = ref<string>()

function setCommitDataContext(commitData?: JJCommitGraphCommitNode) {
  commitDataContext.value = commitData
}

function setCommitIdContext(commitId?: string) {
  commitIdContext.value = commitId
}

function setBookmarkContext(bookmark?: string) {
  bookmarkContext.value = bookmark
}

function setBeforeAfterContext(data?: { before: string, after: string }) {
  beforeCommitIdContext.value = data?.before
  afterCommitIdContext.value = data?.after
}

provide(GRAPH_INTERACTION_CTX_IK, {
  setCommitDataContext,
  setCommitIdContext,
  setBookmarkContext,
  setBeforeAfterContext,
})

const actions = inject(GRAPH_ACTIONS_INJECTION_KEY)!

const commitContextItems: ContextMenuItem[] = [
  {
    label: 'Create Bookmark...',
    icon: 'i-lucide-bookmark-plus',
    onSelect() {
      const commitData = commitDataContext.value
      if (commitData) {
        actions.bookmarkCreate(commitData.changeId)
      }
    }
  },
  {
    label: 'Describe...',
    icon: 'i-lucide-pencil',
    onSelect() {
      const commitData = commitDataContext.value
      if (commitData) {
        actions.describe(commitData.changeId, commitData.description)
      }
    }
  },
  {
    label: 'Edit',
    icon: 'i-lucide-log-in',
    onSelect() {
      const commitData = commitDataContext.value
      if (commitData) {
        actions.edit(commitData.changeId)
      }
    }
  },
  {
    label: 'Duplicate',
    icon: 'i-lucide-copy',
  },
  {
    label: 'Revert',
    icon: 'i-lucide-undo-2',
  },
  {
    label: 'Restore From',
    icon: 'i-lucide-archive-restore',
  },
  {
    label: 'Abandon',
    icon: 'i-lucide-trash',
    onSelect() {
      const commitData = commitDataContext.value
      if (commitData) {
        actions.abandon(commitData.changeId)
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

const emptyContextItems: ContextMenuItem[][] = [[
  {
    label: 'No Actions Available',
    type: 'label'
  }
]]

const commitContextOnlyItems: ContextMenuItem[][] = [
  commitContextItems
]

const commitAndBookmarkContextItems: ContextMenuItem[][] = [
  commitContextItems,
  bookmarkContextItems
]

const menuItems = computed<ContextMenuItem[][]>(() => {
  const commitIdCtx = commitIdContext.value
  const bookmarkCtx = bookmarkContext.value

  if (bookmarkCtx) {
    return commitAndBookmarkContextItems
  } else if (commitIdCtx) {
    return commitContextOnlyItems
  }
  return emptyContextItems
})

function onOpenChange(open: boolean) {
  if (!open) {
    setCommitDataContext(undefined)
    setCommitIdContext(undefined)
    setBookmarkContext(undefined)
    setBeforeAfterContext(undefined)
  }
}
</script>

<template>
  <UContextMenu :items="menuItems" @update:open="onOpenChange">
    <slot />
  </UContextMenu>
</template>
