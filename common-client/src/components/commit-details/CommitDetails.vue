<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">
import { type JJCommitGraphNodeData } from '@common/jj-graph-parser/commit-graph-parser'
import CommitDetailsDiff from './diff';
import { provide } from 'vue';
import { COMMIT_ID_INJECTION_KEY } from '@common-client/providers/commit-id-provider';
import IdPrefix from '../IdPrefix.vue';
import { Pin, X } from 'lucide-vue-next';

type ThisComponentProps = {
  nodeData?: JJCommitGraphNodeData
  pinned?: boolean
}

const { nodeData, pinned } = defineProps<ThisComponentProps>()

type ThisComponentEmits = {
  (e: 'close'): void
  (e: 'pin'): void
}

if (nodeData?.type === 'commit' || nodeData?.type === 'commitId') {
  provide(COMMIT_ID_INJECTION_KEY, nodeData.commitId)
}

const emit = defineEmits<ThisComponentEmits>()
</script>

<template>
  <div class="commit-details">
    <div class="controls">
      <span v-if="!pinned" @click="emit('pin')" class="control"><Pin :size="16" /></span>
      <!-- The click.stop is required here to stop the click event propagation.
           Otherwise it will be treated as though the user selected the commit again after closing it -->
      <span @click.stop="emit('close')" class="control"><X :size="16" /></span>
    </div>
    <template v-if="nodeData && nodeData.type === 'commit'">
      <div class="meta-and-diff-pane user-select-text">
        <div class="commit-meta">
          <div class="commit-meta-kv">
            <span>Change</span><IdPrefix :id="nodeData.changeId" :prefix="nodeData.changeIdPrefixLen" />
            <span>Commit</span><IdPrefix :id="nodeData.commitId" :prefix="nodeData.commitIdPrefixLen" />
            <template v-if="nodeData.parents && nodeData.parents.length === 1">
              <span>Parent</span><pre><span class="id-rest">{{ nodeData.parents[0] }}</span></pre>
            </template>
            <template v-else-if="nodeData.parents && nodeData.parents.length > 1">
              <template v-for="(parent, idx) in nodeData.parents">
                <span>Parent {{ idx + 1 }}</span><pre><span class="id-rest">{{ parent }}</span></pre>
              </template>
            </template>
            <span>Author</span><span>{{ nodeData.author.name }} &lt;<a :href="`mailto:${nodeData.author.email}`">{{ nodeData.author.email }}</a>&gt;</span>
            <span>Author Timestamp</span><pre>{{ nodeData.author.timestamp }}</pre>
            <span>Committer</span><span>{{ nodeData.committer.name }} &lt;<a :href="`mailto:${nodeData.committer.email}`">{{ nodeData.committer.email }}</a>&gt;</span>
            <span>Committer Timestamp</span><pre>{{ nodeData.committer.timestamp }}</pre>
          </div>
          <br />
          <div class="commit-meta-desc">{{ nodeData.description }}</div>
        </div>
        <div class="commit-diff">
          <CommitDetailsDiff :diff-summary-raw="nodeData.diffSummaryRaw" mode="tree" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>

.commit-details {
  height: inherit;
  display: flex;
  flex-direction: column;
}

.controls {
  display: flex;
  justify-content: end;

  padding-top: 4px;
  padding-inline: 4px;
  gap: 4px;
}

.control {
  cursor: pointer;
  user-select: none;
}

.control:hover {
  background-color: rgba(128, 128, 128, 0.5);
}

.meta-and-diff-pane {
  display: flex;
  gap: 8px;
  padding: 4px;
}

.commit-meta,
.commit-diff {
  flex: 1 0 0;
}

.commit-meta-kv {
  display: grid;
  grid-template-columns: max-content 1fr;

  gap: 0px 4px;
}

/* Commit Description Scrollability */
.commit-meta {
  display: flex;
  flex-direction: column;
}

.commit-meta-desc {
  white-space: pre-wrap;
}

.commit-meta-desc {
  height: 0;
  flex-grow: 1;
  overflow: auto;

  scrollbar-width: thin;
}
/* Commit Description Scrollability */

.commit-diff {
  overflow: auto;

  scrollbar-width: thin;
}

.meta-and-diff-pane {
  height: 0;
  flex-grow: 1;
}

.user-select-text {
  user-select: text;
}

</style>
