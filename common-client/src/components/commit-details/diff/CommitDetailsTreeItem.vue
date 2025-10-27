<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">
import { ref } from 'vue';
import { type DiffSummaryTree } from '@common/jj-graph-parser/diff-summary-parser';

type ThisComponentProps = {
  tree: DiffSummaryTree
}

const { tree } = defineProps<ThisComponentProps>()

const expanded = ref<boolean>(true)

function toggleExpanded() {
  expanded.value = !expanded.value
}

</script>

<template>
  <template v-if="tree.type === 'leaf'">
    <div class="file" :class="[ `status-${tree.item.status}` ]"><span>{{ tree.path }}</span></div>
  </template>
  <template v-else-if="tree.type === 'tree'">
    <template v-if="!tree.path">
      <!-- Root node -->
      <template v-if="tree.children.length > 0">
        <CommitDetailsTreeItem v-for="c in tree.children" :tree="c" />
      </template>
      <template v-else>
        <span>(empty)</span>
      </template>
    </template>
    <template v-else>
      <div class="tree">
        <span class="tree-expand" @click.self="toggleExpanded">{{ (expanded ? '-' : '+') }} {{ tree.path }}</span>
        <div class="nested-tree" v-if="expanded"><CommitDetailsTreeItem v-for="c in tree.children" :tree="c" /></div>
      </div>
    </template>
  </template>

</template>

<style scoped>
.nested-tree {
  margin-left: 16px;
}

.file,
.tree {
  user-select: none;
}

.file,
.tree-expand {
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
