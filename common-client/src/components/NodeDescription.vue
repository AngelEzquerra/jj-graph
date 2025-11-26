<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">
import { GRAPH_INTERACTION_CTX_IK } from '@common-client/providers/graph-interaction-ctx-provider';
import { type JJCommitGraphNodeData } from '@common/jj-graph-parser/commit-graph-parser'
import { Bookmark, Tag } from 'lucide-vue-next';
import { computed, inject } from 'vue';

type ThisComponentProps = {
  nodeData?: JJCommitGraphNodeData
  color?: string
  fileHighlight?: boolean
}

type JJBookmark = {
  name: string
  local: boolean
  remotes: string[]
}

const { nodeData, color, fileHighlight } = defineProps<ThisComponentProps>()

const bookmarks = computed<JJBookmark[]>(() => {
  if (nodeData?.type !== 'commit') {
    return []
  }
  const items = [ ...nodeData.bookmarksLocal.map(x => ({ name: x.name, local: true, remotes: [] } as JJBookmark)) ]
  for (const remoteBookmark of nodeData.bookmarksRemote) {
    const existingItem = items.find(x => x.name === remoteBookmark.name)
    if (existingItem) {
      existingItem.remotes.push(remoteBookmark.remote)
    } else {
      items.push({ name: remoteBookmark.name, local: false, remotes: [ remoteBookmark.remote ] })
    }
  }
  return items
})

const DESCRIPTION_TEXT_ROOT = '(root)'
const DESCRIPTION_TEXT_NOT_SET = '(no description set)'
const DESCRIPTION_TEXT_ELIDED = '(elided revisions)'
const DESCRIPTION_TEXT_ONLY_COMMIT_ID = '(only commit_id found)'

const LF_REPLACEMENT_CHAR = '\u23CE'
// const LF_REPLACEMENT_CHAR = '\u2424'
const CR_REPLACEMENT_CHAR = '\u240D'

const descriptionText = computed(() => {
  if (nodeData?.type === 'commit') {
    if (nodeData.commitId.split('').every(x => x === '0')) {
      return DESCRIPTION_TEXT_ROOT
    } else if (nodeData.description) {
      return nodeData.description.trimEnd().replace(/\n/g, LF_REPLACEMENT_CHAR).replace(/\r/g, CR_REPLACEMENT_CHAR)
    } else {
      return DESCRIPTION_TEXT_NOT_SET
    }
  } else if (nodeData?.type === 'elided') {
    return DESCRIPTION_TEXT_ELIDED
  } else if (nodeData?.type === 'commitId') {
    return DESCRIPTION_TEXT_ONLY_COMMIT_ID
  } else {
    return DESCRIPTION_TEXT_ELIDED
  }
})

const interactionCtx = inject(GRAPH_INTERACTION_CTX_IK)!

</script>

<template>
  <template v-if="nodeData">
    <template v-if="nodeData.type === 'commit'">
      <span v-if="nodeData.isWorkingCopy" class="chip chip-content">@</span>
      <span v-if="fileHighlight" class="chip chip-content">F</span>
      <span v-if="nodeData.isEmpty" class="chip chip-content">empty</span>
      <template v-if="bookmarks?.length > 0">
        <span v-for="b in bookmarks" class="bookmark" @contextmenu="interactionCtx.setBookmarkContext(b.name)">
          <span class="pill" :style="{ backgroundColor: color }"><Bookmark :size="16" /></span>
          <span class="bookmark-name">{{ b.name }}</span>
          <span class="bookmark-local faded" v-if="b.local">jj</span>
          <span class="bookmark-remote" v-for="remote in b.remotes">{{ remote }}</span>
        </span>
      </template>
      <span v-for="tag in nodeData.tags" class="tag">
        <span class="pill" :style="{ backgroundColor: color }"><Tag :size="16" /></span>
        <span class="tag-name">{{ tag.name }}</span>
      </span>
      <span class="description-text">{{ descriptionText }}</span>
    </template>
    <template v-else-if="nodeData.type === 'elided'">
      <span class="description-text elided-revision faded">{{ DESCRIPTION_TEXT_ELIDED }}</span>
    </template>
    <template v-else-if="nodeData.type === 'commitId' && nodeData.commitId">
      <span>{{ DESCRIPTION_TEXT_ONLY_COMMIT_ID }}</span>
    </template>
    <template v-else>
      <span class="description-text elided-revision faded">{{ DESCRIPTION_TEXT_ELIDED }}</span>
    </template>
  </template>
</template>

<style scoped>
.pill {
  width: 20px;

  display: inline-flex;
  justify-content: space-around;
  align-items: center;

  color: var(--ui-text-inverted);
}

.chip,
.bookmark,
.tag {
  flex: auto 0 0;
  display: flex;
  overflow: hidden;
}

.chip,
.bookmark,
.tag {
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, 0.75);

  margin-right: 4px;
}

.bookmark-remote {
  font-style: italic;
}

.faded {
  color: var(--ui-text-dimmed);
}

.chip-content,
.tag-name,
.bookmark-name {
  padding-inline: 4px;
  /* border-left: 1px solid rgba(128, 128, 128, 0.75); */
}

.bookmark-local,
.bookmark-remote {
  padding-inline: 4px;
  border-left: 1px solid rgba(128, 128, 128, 0.75);
}

.description-text {
  display: inline-block;
  text-overflow: ellipsis;
  width: 0;
  flex-grow: 1;
  overflow: clip;
}

</style>
