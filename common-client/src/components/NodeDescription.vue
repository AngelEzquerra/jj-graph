<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">
import { type JJCommitGraphNodeData } from '@common/jj-graph-parser/commit-graph-parser'
import { computed } from 'vue';

type ThisComponentProps = {
  nodeData?: JJCommitGraphNodeData
  color?: string
}

type JJBookmark = {
  name: string
  local: boolean
  remotes: string[]
}

const { nodeData, color } = defineProps<ThisComponentProps>()

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
</script>

<template>
  <template v-if="nodeData">
    <template v-if="nodeData.type === 'commit'">
      <template v-if="bookmarks?.length > 0">
        <span v-for="b in bookmarks" class="bookmark">
          <span class="pill-color" :style="{ backgroundColor: color }"></span>
          <span class="bookmark-name">{{ b.name }}</span>
          <span class="bookmark-local faded" v-if="b.local">jj</span>
          <span class="bookmark-remote" v-for="remote in b.remotes">{{ remote }}</span>
        </span>
      </template>
      <span v-for="tag in nodeData.tags" class="tag">
        <span class="pill-color" :style="{ backgroundColor: color }"></span>
        <span class="tag-name">{{ tag.name }}</span>
      </span>
      <span v-if="nodeData.commitId.split('').every(x => x === '0')">Root</span>
      <span v-else-if="nodeData.description">{{ nodeData.description }}</span>
      <span v-else>(no description set)</span>
    </template>
    <template v-else-if="nodeData.type === 'elided'">
      <span class="elided-revision faded">(elided revisions)</span>
    </template>
    <template v-else-if="nodeData.type === 'commitId' && nodeData.commitId">
      <span>Commit: {{ nodeData.commitId }}</span>
    </template>
    <template v-else>
      <span class="elided-revision faded">(elided revisions)</span>
    </template>
  </template>
</template>

<style scoped>

.pill-color {
  width: 16px;
}

.bookmark,
.tag {
  flex: auto 0 0;
  display: flex;
  overflow: hidden;
}

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
  color: rgba(204, 204, 204, 0.45);
}

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

</style>
