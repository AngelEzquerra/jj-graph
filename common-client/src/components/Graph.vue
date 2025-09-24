<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script lang="ts" setup>
import NodeDescription from './NodeDescription.vue'
import { computed, ref, watch } from 'vue'
import { renderLogic } from '@common/jj-graph-renderer'
import { unit } from '@common/jj-graph-renderer/svg-renderer'
import { type JJCommitGraphNodeData } from '@common/jj-graph-parser/commit-graph-parser'
import { type NodeColumnGenOptions } from '@common/jj-graph-renderer/layout'

type NodeId = number
type EdgeId = number
type GraphNode<NodeData> = {
  id: NodeId
  data?: NodeData
  parents: NodeId[]
  children: NodeId[]
}

type ThisComponentProps = {
  commits: GraphNode<JJCommitGraphNodeData>[]
  opts: NodeColumnGenOptions
}

const { commits, opts } = defineProps<ThisComponentProps>()

const debugComputed = false

function computedL<T>(log: string, f: () => T) {
  if (debugComputed) {
    return computed(() => {
      console.trace(log, Date.now())
      return f()
    })
  } else {
    return computed(f)
  }
}

const renderData = computedL('renderData', () => renderLogic(commits, opts))
const graphColumnCount = computedL('graphColumnCount', () => renderData.value[0] + 1)
const nodesToDraw = computedL('nodesToDraw', () => renderData.value[1].map(x => ({ ...x, uiBaseId: `bn_${x.id}`, uiHighlightId: `hn_${x.id}`})))
const edgesToDraw = computedL('edgesToDraw', () => renderData.value[2].map(x => ({ ...x, uiBaseId: `be_${x.id}`, uiHighlightId: `he_${x.id}`})))

const highlightedNodeId = ref<NodeId>()
const highlightedEdgeId = ref<EdgeId>()
const emptyNodeIdSet: NodeId[] = []
const highlightedParentNodeIds = computedL('highlightedParentNodeIds', () => {
  const hNodeId = highlightedNodeId.value
  if (hNodeId === undefined) {
    return emptyNodeIdSet
  }
  const hNode = commits[hNodeId]
  if (hNode === undefined) {
    return emptyNodeIdSet
  }
  return hNode.parents
})

const emptyEdgeIdSet = new Set<number>()
const highlightedEdges = computedL('highlightedEdges', () => {
  const hNodeId = highlightedNodeId.value
  if (hNodeId === undefined) {
    return emptyEdgeIdSet
  }
  return new Set(edgesToDraw.value.map((e, i) => [ e, i ] as const).filter(([ e, i ]) => e.from === hNodeId).map(([ e, i ]) => i))
})

function highlightNode(nodeId: NodeId) {
  highlightedNodeId.value = nodeId
}

function removeNodeHighlight() {
  highlightedNodeId.value = undefined
}

function highlightEdge(edgeId: EdgeId) {
  highlightedEdgeId.value = edgeId
}

function removeEdgeHighlight() {
  highlightedEdgeId.value = undefined
}

const colorMap = [
  '#0085d9',
  '#d9008f',
  '#00d90a',
  '#d98500',
  '#a300d9',
  '#ff0000',
  '#00d9cc',
  '#e138e8',
  '#85d900',
  '#dc5b23',
  '#6f24d6',
  '#ffcc00',
]

</script>

<template>
  <div class="graph-grid-container">
    <table class="graph-content-container" v-memo="[ commits ]">
      <tr v-for="(node, r) in commits" :key="r" class="graph-row" @mouseenter="highlightNode(node.id)" @mouseleave="removeNodeHighlight">
        <td class="node-description"><NodeDescription :node-data="node.data" :color="colorMap[nodesToDraw[r]!.c % colorMap.length]" /></td>
      </tr>
    </table>
    <div class="graph-container">
      <svg class="graph-svg" :width="unit * graphColumnCount" :height="unit * commits.length">
        <g v-for="lineToDraw in edgesToDraw" :key="lineToDraw.uiBaseId" v-memo="[ edgesToDraw ]">
          <path :d="lineToDraw.d" stroke-width="5" stroke-linecap="round" stroke="black" fill="none"></path>
          <path :d="lineToDraw.d" stroke-width="2" stroke-linecap="round" :stroke="colorMap[lineToDraw.c % colorMap.length]" fill="none"></path>
        </g>
        <circle v-for="nodeToDraw in nodesToDraw" :key="nodeToDraw.uiBaseId" :cx="nodeToDraw.x" :cy="nodeToDraw.y" r="4" :fill="colorMap[nodeToDraw.c % colorMap.length]" stroke="black" stroke-width="1"></circle>

        <g v-for="lineToDraw in edgesToDraw" :key="lineToDraw.uiHighlightId" v-memo="[highlightedEdges.has(lineToDraw.id), edgesToDraw ]">
          <!-- <path :d="lineToDraw.d" stroke-width="8" stroke-linecap="round" :stroke="highlightedEdges.has(lineToDraw.id) ? `white` : `none`" fill="none"></path> -->
          <path :d="lineToDraw.d" stroke-width="5" stroke-linecap="round" :stroke="highlightedEdges.has(lineToDraw.id) ? `white` : `none`" fill="none"></path>
          <path :d="lineToDraw.d" stroke-width="2" stroke-linecap="round" :stroke="highlightedEdges.has(lineToDraw.id) ? colorMap[lineToDraw.c % colorMap.length] : `none`" fill="none"></path>
        </g>
        <g v-for="nodeToDraw in nodesToDraw" :key="nodeToDraw.uiHighlightId" v-memo="[highlightedNodeId === nodeToDraw.id, highlightedParentNodeIds.includes(nodeToDraw.id), nodesToDraw ]">
          <circle :cx="nodeToDraw.x" :cy="nodeToDraw.y" r="6" :fill="highlightedNodeId === nodeToDraw.id ? `white` : highlightedParentNodeIds.includes(nodeToDraw.id) ? `green` : `none`" stroke="none"></circle>
          <circle :cx="nodeToDraw.x" :cy="nodeToDraw.y" r="4" :fill="highlightedNodeId === nodeToDraw.id || highlightedParentNodeIds.includes(nodeToDraw.id) ? colorMap[nodeToDraw.c % colorMap.length] : `none`" :stroke="highlightedNodeId === nodeToDraw.id || highlightedParentNodeIds.includes(nodeToDraw.id) ? `black`: `none`" stroke-width="1"></circle>
        </g>

        <g class="pointer-events-all" v-memo="[ edgesToDraw, nodesToDraw ]">
          <path v-for="lineToDraw in edgesToDraw" :key="lineToDraw.uiBaseId" :d="lineToDraw.d" stroke-width="15" stroke="none" fill="none" @mouseenter="highlightNode(lineToDraw.from)" @mouseleave="removeNodeHighlight"></path>
          <circle v-for="nodeToDraw in nodesToDraw" :key="nodeToDraw.uiBaseId" :cx="nodeToDraw.x" :cy="nodeToDraw.y" r="18" fill="none" stroke="none" @mouseenter="highlightNode(nodeToDraw.id)" @mouseleave="removeNodeHighlight"></circle>
        </g>
      </svg>
    </div>

  </div>

</template>

<style scoped>

.graph-svg {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  /* z-index: -1; */
}

.graph-grid-container {
  position: relative;

  --graph-width: 200px;
  --content-width: 400px;
}

.graph-content-container {
  border-spacing: 0;
  table-layout: fixed;
  width: calc(var(--graph-width) + var(--content-width));
}

.graph-content-container {
  user-select: none;
}

.graph-container {
  position: absolute;
  top: 0;
  bottom: 0;

  width: var(--graph-width);
  overflow-x: auto;
  overflow-y: hidden; /* Why do we need this workaround. Let's see if we can fix it sometime */
}

.graph-row {
  cursor: pointer;
}

.graph-row:hover {
  background-color: rgba(128, 128, 128, 0.15);
}

.node-description {
  display: flex;
  height: calc(v-bind('unit') * 1px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  margin-left: var(--graph-width);
  align-items: center;
}

.pointer-events-all {
  pointer-events: all;
}
</style>
