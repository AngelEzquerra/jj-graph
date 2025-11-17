<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script lang="ts" setup>
import { useDevTestOptionsStore } from '@common-client/stores/devTestOptions';
import { storeToRefs } from 'pinia';

const devTestOptionsStore = useDevTestOptionsStore()
const { useLogNodeMarkersOption, logNodeMarkerSizeOption } = storeToRefs(devTestOptionsStore)

type NodeId = number
type EdgeId = number

type NodeToDraw = {
    id: number;
    x: number;
    y: number;
    c: number;
    t?: string
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
  highlightedNodeIds: number[]
  raisedNodeIds: number[]
  highlightedEdges: Set<number>
}

type ThisComponentEmits = {
  (e: 'mouseEnterNode', nodeId: NodeId): void
  (e: 'mouseLeaveNode', nodeId: NodeId): void
  (e: 'mouseEnterEdge', edgeId: EdgeId): void
  (e: 'mouseLeaveEdge', edgeId: EdgeId): void
}

const { nodesToDraw, edgesToDraw, colorMap, highlightedNodeIds, raisedNodeIds, highlightedEdges } = defineProps<ThisComponentProps>()
const emit = defineEmits<ThisComponentEmits>()

const defaultGlyph = '●'
const defaultGlyphReplacementMap: Record<string, string> = {
  '○': '●'
}
const glyphReplacementMap = defaultGlyphReplacementMap

// const chars = '@◆●×v-~'
// const nodeToCharMap =  Object.fromEntries(nodesToDraw.map(x => [ x.id, chars[Math.floor(Math.random() * chars.length)] ]))

const nodeToCharMap =  Object.fromEntries(nodesToDraw.map(x => {
  const originalGlyph = x.t
  const replacement = originalGlyph ? glyphReplacementMap[originalGlyph] : defaultGlyph
  const glyph = replacement ?? originalGlyph ?? defaultGlyph
  return [ x.id,  glyph]
}))

</script>

<template>
  <g class="pointer-events-none">
    <g v-for="edgeToDraw in edgesToDraw" :key="edgeToDraw.id">
      <path :d="edgeToDraw.d" class="base jj-edge-stroke" ></path>
      <path :d="edgeToDraw.d" class="base jj-edge-fill" :color="colorMap[edgeToDraw.c % colorMap.length]"></path>
    </g>
  </g>
  <g class="pointer-events-none">
    <g v-for="nodeToDraw in nodesToDraw" :key="nodeToDraw.id">
      <template v-if="useLogNodeMarkersOption">
        <text :x="nodeToDraw.x" :y="nodeToDraw.y" class="base jj-node-text" :color="colorMap[nodeToDraw.c % colorMap.length]">{{ nodeToCharMap[nodeToDraw.id] }}</text>
      </template>
      <template v-else>
        <circle :cx="nodeToDraw.x" :cy="nodeToDraw.y" class="base jj-node" r="4" :color="colorMap[nodeToDraw.c % colorMap.length]"></circle>
      </template>
     </g>
  </g>
  <g class="pointer-events-none">
    <g v-for="edgeToDraw in edgesToDraw" :key="edgeToDraw.id" v-memo="[ edgesToDraw, highlightedEdges.has(edgeToDraw.id) ]">
      <path :d="edgeToDraw.d" :class="{ highlighted: highlightedEdges.has(edgeToDraw.id) }" class="highlight jj-edge-stroke"></path>
      <path :d="edgeToDraw.d" :class="{ highlighted: highlightedEdges.has(edgeToDraw.id) }" class="highlight jj-edge-fill" :color="colorMap[edgeToDraw.c % colorMap.length]"></path>
    </g>
  </g>
  <g class="pointer-events-none">
    <g v-for="nodeToDraw in nodesToDraw" :key="nodeToDraw.id" v-memo="[ nodesToDraw, raisedNodeIds.includes(nodeToDraw.id), highlightedNodeIds.includes(nodeToDraw.id) ]">
      <template v-if="useLogNodeMarkersOption">
        <text :x="nodeToDraw.x" :y="nodeToDraw.y" :class="{ highlighted: highlightedNodeIds.includes(nodeToDraw.id), raised: raisedNodeIds.includes(nodeToDraw.id) }" class="highlight jj-node-text" :color="colorMap[nodeToDraw.c % colorMap.length]">{{ nodeToCharMap[nodeToDraw.id] }}</text>
      </template>
      <template v-else>
        <circle :cx="nodeToDraw.x" :cy="nodeToDraw.y" :class="{ highlighted: highlightedNodeIds.includes(nodeToDraw.id), raised: raisedNodeIds.includes(nodeToDraw.id) }" class="highlight jj-node-outline" r="6.5"></circle>
        <circle :cx="nodeToDraw.x" :cy="nodeToDraw.y" :class="{ highlighted: highlightedNodeIds.includes(nodeToDraw.id), raised: raisedNodeIds.includes(nodeToDraw.id) }" class="highlight jj-node" r="4" :color="colorMap[nodeToDraw.c % colorMap.length]"></circle>
      </template>
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
.pointer-events-none {
  pointer-events: none;
}
.pointer-events-visible {
  pointer-events: visible;
}
.pointer-events-visiblestroke {
  pointer-events: visiblestroke;
}

.jj-edge-fill,
.jj-edge-stroke {
  stroke-linecap: none;
  fill: none;
}

.jj-edge-stroke.highlight,
.jj-edge-stroke.base {
  stroke-width: 5;
}

.jj-edge-fill.highlight,
.jj-edge-fill.base {
  stroke-width: 2;
}

.jj-edge-fill {
  stroke: currentColor;
}

.jj-edge-stroke {
  stroke: var(--jj-graph-bg-color);
}

.jj-edge-fill.highlight,
.jj-edge-stroke.highlight {
  stroke: none;
}

.jj-edge-fill.highlight.highlighted {
  stroke: currentColor;
}

.jj-edge-stroke.highlight.highlighted {
  stroke: var(--jj-graph-highlight-color);
}

.jj-node {
  paint-order: stroke;
  stroke: var(--jj-graph-bg-color);
  fill: currentColor;
}

.jj-node.highlight,
.jj-node.base {
  stroke-width: 2;
}

.jj-node.highlight {
  stroke: none;
  fill: none;
}

.jj-node.highlight.raised,
.jj-node.highlight.highlighted {
  stroke: var(--jj-graph-bg-color);
  fill: currentColor;
}

.jj-node-outline {
  fill: none;
}

.jj-node-outline.highlight.raised {
  fill: none;
}

.jj-node-outline.highlight.highlighted {
  fill: var(--jj-graph-highlight-color);
}

.jj-node-text {
  paint-order: stroke;
  text-anchor: middle;
  dominant-baseline: central;

  font-size: 20px;
  font-size: calc(v-bind('logNodeMarkerSizeOption') * 1px);
  font-weight: 700;
  font-family: 'BundledCascadiaMono';
}

.jj-node-text {
  fill: currentColor;
  stroke-width: 3;
  stroke: var(--jj-graph-bg-color);
}

.jj-node-text.highlight {
  fill: none;
  stroke: none;
}

.jj-node-text.highlight.raised {
  fill: currentColor;
  /* stroke-width: 7; */
  stroke: var(--jj-graph-bg-color);
}

.jj-node-text.highlight.highlighted {
  fill: currentColor;
  stroke: var(--jj-graph-highlight-color);
}

.jj-node-text-outline {
  fill: var(--jj-graph-bg-color);
}

.jj-node-text-outline.highlight {
  fill: none;
}

.jj-node-text-outline.highlight.raised {
  fill: var(--jj-graph-bg-color);
}
.jj-node-text-outline.highlight.highlighted {
  fill: none;
}
</style>
