<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">
import { COMMIT_ID_INJECTION_KEY } from '@common-client/providers/commit-id-provider';
import { GRAPH_ACTIONS_INJECTION_KEY } from '@common-client/providers/graph-actions-provider';
import { type DiffSummaryItem, flattenDiffPathItemsForDisplay } from '@common/jj-graph-parser/diff-summary-parser';
import { inject } from 'vue';

const actions = inject(GRAPH_ACTIONS_INJECTION_KEY)!
const commitId = inject(COMMIT_ID_INJECTION_KEY)!

type ThisComponentProps = {
  item: DiffSummaryItem
}

const { item } = defineProps<ThisComponentProps>()

</script>

<template>
  <div class="file" :class="[ `status-${item.status}` ]" @click="actions.viewDiff(commitId, item.source.path, item.target.path)"><span>{{ flattenDiffPathItemsForDisplay(item.pathItems) }}</span></div>
</template>

<style scoped>
.file {
  user-select: none;
}

.file {
  cursor: pointer;
}

.status-C,
.status-A {
  color: var(--jj-graph-color-added)
}

.status-R,
.status-M {
  color: var(--jj-graph-color-modified)
}

.status-D {
  color: var(--jj-graph-color-deleted)
}
</style>
