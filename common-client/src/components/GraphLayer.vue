<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script lang="ts" setup>
type NodeId = number
type EdgeId = number

type NodeToDraw = {
    id: number;
    x: number;
    y: number;
    c: number;
}

type EdgeToDraw = {
    id: number;
    from: number;
    to: number;
    d: string;
    c: number;
}

type ThisComponentProps = {
  nodesToDraw: NodeToDraw[]
  edgesToDraw: EdgeToDraw[]
  colorMap: string[]
  highlightedNodeId?: number
  highlightedParentNodeIds: number[]
  highlightedEdges: Set<number>
}

type ThisComponentEmits = {
  (e: 'mouseEnterNode', nodeId: NodeId): void
  (e: 'mouseLeaveNode', nodeId: NodeId): void
  (e: 'mouseEnterEdge', edgeId: EdgeId): void
  (e: 'mouseLeaveEdge', edgeId: EdgeId): void
}

const { layerType, nodesToDraw, edgesToDraw, colorMap, highlightedNodeId, highlightedParentNodeIds, highlightedEdges } = defineProps<ThisComponentProps>()
const emit = defineEmits<ThisComponentEmits>()

</script>

<template>
  <g>
    <g v-for="edgeToDraw in edgesToDraw" :key="edgeToDraw.id">
      <path :d="edgeToDraw.d" stroke-width="5" stroke-linecap="round" stroke="black" fill="none"></path>
      <path :d="edgeToDraw.d" stroke-width="2" stroke-linecap="round" :stroke="colorMap[edgeToDraw.c % colorMap.length]" fill="none"></path>
    </g>
  </g>
  <g>
    <circle v-for="nodeToDraw in nodesToDraw" :key="nodeToDraw.id" :cx="nodeToDraw.x" :cy="nodeToDraw.y" r="4" :fill="colorMap[nodeToDraw.c % colorMap.length]" stroke="black" stroke-width="1"></circle>
  </g>
  <g>
    <g v-for="edgeToDraw in edgesToDraw" :key="edgeToDraw.id" v-memo="[ edgesToDraw, highlightedEdges.has(edgeToDraw.id) ]">
      <!-- <path :d="edgeToDraw.d" stroke-width="8" stroke-linecap="round" :stroke="highlightedEdges.has(edgeToDraw.id) ? `white` : `none`" fill="none"></path> -->
      <path :d="edgeToDraw.d" stroke-width="5" stroke-linecap="round" :stroke="highlightedEdges.has(edgeToDraw.id) ? `white` : `none`" fill="none"></path>
      <path :d="edgeToDraw.d" stroke-width="2" stroke-linecap="round" :stroke="highlightedEdges.has(edgeToDraw.id) ? colorMap[edgeToDraw.c % colorMap.length] : `none`" fill="none"></path>
    </g>
  </g>
  <g>
    <g v-for="nodeToDraw in nodesToDraw" :key="nodeToDraw.id" v-memo="[ nodesToDraw, highlightedNodeId === nodeToDraw.id, highlightedParentNodeIds.includes(nodeToDraw.id) ]">
      <circle :cx="nodeToDraw.x" :cy="nodeToDraw.y" r="6" :fill="highlightedNodeId === nodeToDraw.id ? `white` : highlightedParentNodeIds.includes(nodeToDraw.id) ? `green` : `none`" stroke="none"></circle>
      <circle :cx="nodeToDraw.x" :cy="nodeToDraw.y" r="4" :fill="highlightedNodeId === nodeToDraw.id || highlightedParentNodeIds.includes(nodeToDraw.id) ? colorMap[nodeToDraw.c % colorMap.length] : `none`" :stroke="highlightedNodeId === nodeToDraw.id || highlightedParentNodeIds.includes(nodeToDraw.id) ? `black`: `none`" stroke-width="1"></circle>
    </g>
  </g>
  <g class="pointer-events-visiblestroke">
    <path v-for="edgeToDraw in edgesToDraw" :key="edgeToDraw.id" :d="edgeToDraw.d" stroke-width="7" stroke="none" fill="none" @mouseenter="emit('mouseEnterEdge', edgeToDraw.id)" @mouseleave="emit('mouseLeaveEdge', edgeToDraw.id)"></path>
  </g>
  <g class="pointer-events-visible">
    <circle v-for="nodeToDraw in nodesToDraw" :key="nodeToDraw.id" :cx="nodeToDraw.x" :cy="nodeToDraw.y" r="9" fill="none" stroke="none" @mouseenter="emit('mouseEnterNode', nodeToDraw.id)" @mouseleave="emit('mouseLeaveNode', nodeToDraw.id)"></circle>
  </g>
</template>

<style scoped>
.pointer-events-visible {
  pointer-events: visible;
}
.pointer-events-visiblestroke {
  pointer-events: visiblestroke;
}
</style>
