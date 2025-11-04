<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">
import { computed } from 'vue';
import CommitDetailsTreeItem from './CommitDetailsTreeItem.vue';
import CommitDetailsListItem from './CommitDetailsListItem.vue';
import { parseDiffSummaryRaw, parseDiffSummaryFiles, parseDiffTree } from '@common/jj-graph-parser/diff-summary-parser';
import type { JJDiffSummaryFile } from '@common/models/diff';

type ThisComponentProps = {
  diffSummaryFiles: JJDiffSummaryFile[]
  mode: 'list' | 'tree'
}

const { diffSummaryFiles, mode } = defineProps<ThisComponentProps>()

// const diffSummary = computed(() => parseDiffSummaryRaw(diffSummaryRaw))
// const diffTree = computed(() => parseDiffTree(diffSummary.value))

const diffSummary = computed(() => parseDiffSummaryFiles(diffSummaryFiles))
const diffTree = computed(() => parseDiffTree(diffSummary.value))

</script>

<template>
  <template v-if="mode === 'list'">
    <CommitDetailsListItem v-for="item in diffSummary" :item="item" ></CommitDetailsListItem>
  </template>
  <template v-else-if="mode === 'tree'">
    <CommitDetailsTreeItem :tree="diffTree" />
  </template>
</template>

<style>

:root {
  --jj-graph-color-added: #81b88b;
  --jj-graph-color-modified: #e2c08d;
  --jj-graph-color-deleted: #c74e39;
}

</style>
