<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">
import type { JJCommitGraphNodeData } from '@common/jj-graph-parser/commit-graph-parser';
import NodeDescription from '../NodeDescription.vue';
import { inject } from 'vue';
import { GRAPH_ACTIONS_INJECTION_KEY } from '@common-client/providers/graph-actions-provider';
import IdPrefix from '../IdPrefix.vue';
import { LogIn, Pencil, ArrowUpFromDot, ArrowDownToDot, Trash2, Plus } from "lucide-vue-next";
import DownPlus from '@common-client/icons/DownPlus.vue';
import UpPlus from '@common-client/icons/UpPlus.vue';

const actions = inject(GRAPH_ACTIONS_INJECTION_KEY)!

type NodeId = number

type ThisComponentProps = {
  nodeData: JJCommitGraphNodeData
  color: string
  highlighted: boolean
  selected: boolean
}

type ThisComponentEmits = {
  (e: 'mouseenter'): void
  (e: 'mouseleave'): void
  (e: 'select:single'): void
  (e: 'select:multiple'): void
  (e: 'commit:closepreview'): void
  (e: 'commit:preview'): void
  (e: 'commit:pin'): void
}

const { nodeData, color, selected, highlighted } = defineProps<ThisComponentProps>()
const emit = defineEmits<ThisComponentEmits>()

</script>

<template>
  <div class="display-contents graph-row" :class="{ 'selected': selected }" @mouseenter="emit('mouseenter')" @mouseleave="emit('mouseleave')" @click.exact="emit('select:single')" @click.ctrl.exact="emit('select:multiple')" @click.meta.exact="emit('select:multiple')">
    <div class="display-contents" v-if="nodeData.type === 'commit'" @click.shift.exact="emit('commit:pin')" @mouseenter.shift.exact="emit('commit:preview')" @mouseenter.exact="emit('commit:closepreview')">
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell node-description"><NodeDescription :node-data="nodeData" :color="color" /></div>
      <div class="px-2 grid-cell"><pre>{{ nodeData.author.timestamp }}</pre></div>
      <div class="px-2 grid-cell"><span>{{ nodeData.author.name }}</span></div>
      <div class="px-2 grid-cell"><IdPrefix :id="nodeData.changeId" :prefix="nodeData.changeIdPrefixLen" :prefix-min="8" /></div>
      <div class="px-2 grid-cell"><IdPrefix :id="nodeData.commitId" :prefix="nodeData.commitIdPrefixLen" :prefix-min="8" /></div>
    </div>
    <div class="display-contents" v-else-if="nodeData.type === 'elided'">
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell node-description"><NodeDescription :node-data="nodeData" :color="color" /></div>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell"></div>
    </div>
    <div class="display-contents" v-else-if="nodeData.type === 'commitId'">
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell node-description"><NodeDescription :node-data="nodeData" :color="color" /></div>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell"><pre>{{ nodeData.commitId.slice(0, 8) }}</pre></div>
    </div>
    <div class="display-contents" v-else>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell node-description"></div>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell"></div>
      <div class="px-2 grid-cell"></div>
    </div>
  </div>
</template>

<style scoped>
.display-contents {
  display: contents;
}

.graph-row {
  cursor: pointer;
}

.graph-row:hover .grid-cell {
  background-color: rgba(128, 128, 128, 0.15);
}

.graph-row.selected .grid-cell {
  background-color: rgba(128, 128, 128, 0.25);
}

.graph-row.selected:hover .grid-cell {
  background-color: rgba(128, 128, 128, 0.35);
}

.px-2 {
  padding-inline: 0.5rem;
}

.node-description {
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  align-items: center;
}

.pointer-events-none {
  pointer-events: none;
}
</style>
