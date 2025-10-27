<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">
import { type DiffSummaryItem } from '@common/jj-graph-parser/diff-summary-parser';

type ThisComponentProps = {
  item: DiffSummaryItem
}

const { item } = defineProps<ThisComponentProps>()

</script>

<template>
  <div class="file" :class="[ `status-${item.status}` ]"><span>{{ item.path }}</span></div>
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
