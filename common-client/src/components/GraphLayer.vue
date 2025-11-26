<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script lang="ts" setup>
import { useDevTestOptionsStore } from '@common-client/stores/devTestOptions';
import type { JJCommitGraphNodeData } from '@common/jj-graph-parser/commit-graph-parser';
import { storeToRefs } from 'pinia';
import { useId } from 'vue';

const devTestOptionsStore = useDevTestOptionsStore()
const { useLogNodeMarkersOption, logNodeMarkerSizeOption } = storeToRefs(devTestOptionsStore)

type NodeId = number
type EdgeId = number

type NodeToDraw = {
    id: number;
    x: number;
    y: number;
    c: number;
    t?: string;
    data?: JJCommitGraphNodeData
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

const thisComponentId = useId()

const nodeTypeRegular = 'regular'
const nodeTypeImmutable = 'immutable'
const nodeTypeElided = 'elided'
const nodeTypeTerminating = 'terminating'
const nodeTypeWorkingCopy = 'wc'
const nodeDefIds = Object.fromEntries([
  nodeTypeRegular,
  nodeTypeImmutable,
  nodeTypeElided,
  nodeTypeTerminating,
  nodeTypeWorkingCopy,
].map(x => [ x, { base: `${thisComponentId}-base-${x}`, outline: `${thisComponentId}-outline-${x}` } ]))
const nodeDefIdConflicted = `${thisComponentId}-conflicted`

const hrefs = Object.fromEntries([
  ...Object.values(nodeDefIds).flatMap(x => [ x.base, x.outline ]),
  nodeDefIdConflicted,
].map(x => [ x, `#${x}` ]))

function nodeTypeFromCommitData(data?: JJCommitGraphNodeData) {
  if (data?.type === 'commit') {
    if (data.isImmutable) {
      return nodeTypeImmutable
    } else if (data.isWorkingCopy) {
      return nodeTypeWorkingCopy
    }
    return nodeTypeRegular
  } else if (data?.type === 'elided') {
    return nodeTypeElided
  } else if (data?.type === 'commitId' && data.commitId) {
    return nodeTypeRegular
  } else {
    return nodeTypeTerminating
  }
}

const nodeToHrefMap = Object.fromEntries(nodesToDraw.map(x => {
  const nodeType = nodeTypeFromCommitData(x.data)
  return [ x.id, { base: hrefs[nodeDefIds[nodeType]!.base], outline: hrefs[nodeDefIds[nodeType]!.outline] } ]
}))

const nodeConflictedMap = Object.fromEntries(nodesToDraw.map(x => {
  const isConflicted = x.data?.type === 'commit' && x.data.isConflicted
  return [ x.id, isConflicted ]
}))

</script>

<template>
  <defs>
    <circle :id="nodeDefIds[nodeTypeRegular]!.base" r="4" class="jj-node prefer-stroke"/>
    <circle :id="nodeDefIds[nodeTypeRegular]!.outline" r="6.5" />

    <path :id="nodeDefIds[nodeTypeImmutable]!.base" d="M-5 0L0 -5L5 0L0 5Z" />
    <path :id="nodeDefIds[nodeTypeImmutable]!.outline" d="M-9 0L0 -9L9 0L0 9Z" />

    <g :id="nodeDefIds[nodeTypeElided]!.base">
      <circle cx="-8" r="2" />
      <circle cx="-2.5" r="2" />
      <circle cx="2.5" r="2" />
      <circle cx="8" r="2" />
    </g>
    <g :id="nodeDefIds[nodeTypeElided]!.outline">
      <circle cx="-8" r="5" />
      <circle cx="-2.5" r="5" />
      <circle cx="2.5" r="5" />
      <circle cx="8" r="5" />
    </g>

    <g :id="nodeDefIds[nodeTypeTerminating]!.base">
      <path style="stroke-linecap: square;" d="M-7 0L7 0" stroke-width="4" />
      <path style="stroke-linecap: square;" d="M-7 0L7 0" class="jj-node prefer-stroke" />
    </g>
    <path :id="nodeDefIds[nodeTypeTerminating]!.outline" style="stroke-linecap: square;" d="M-7 0L7 0" stroke-width="7" />

    <g :id="nodeDefIds[nodeTypeWorkingCopy]!.base" class="jj-node prefer-stroke">
      <circle r="4"></circle>
      <circle r="0.5"></circle>
    </g>
    <circle :id="nodeDefIds[nodeTypeWorkingCopy]!.outline" r="6.5" />

    <g :id="nodeDefIdConflicted">
      <path d="M5 5L10 10M10 5L5 10" style="stroke-linecap: square;" stroke-width="5" />
      <path d="M5 5L10 10M10 5L5 10" style="stroke-linecap: square;" stroke="red" stroke-width="2" />
    </g>
  </defs>
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
         <use :href="nodeToHrefMap[nodeToDraw.id]?.base" :x="nodeToDraw.x" :y="nodeToDraw.y" class="base jj-node" :color="colorMap[nodeToDraw.c % colorMap.length]" />
         <use v-if="nodeConflictedMap[nodeToDraw.id]" :href="hrefs[nodeDefIdConflicted]" :x="nodeToDraw.x" :y="nodeToDraw.y" class="base jj-node" />
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
        <use :href="nodeToHrefMap[nodeToDraw.id]?.outline" :x="nodeToDraw.x" :y="nodeToDraw.y" :class="{ highlighted: highlightedNodeIds.includes(nodeToDraw.id), raised: raisedNodeIds.includes(nodeToDraw.id) }" class="highlight jj-node-outline" />
        <use :href="nodeToHrefMap[nodeToDraw.id]?.base" :x="nodeToDraw.x" :y="nodeToDraw.y" :class="{ highlighted: highlightedNodeIds.includes(nodeToDraw.id), raised: raisedNodeIds.includes(nodeToDraw.id) }" class="highlight jj-node" :color="colorMap[nodeToDraw.c % colorMap.length]" />

        <use v-if="nodeConflictedMap[nodeToDraw.id]" :href="hrefs[nodeDefIdConflicted]" :x="nodeToDraw.x" :y="nodeToDraw.y" :class="{ highlighted: highlightedNodeIds.includes(nodeToDraw.id), raised: raisedNodeIds.includes(nodeToDraw.id) }" class="highlight jj-node-outline" />
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

.jj-node.prefer-stroke {
  paint-order: normal;
  stroke: currentColor;
  fill: var(--jj-graph-bg-color);
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

.jj-node.highlight.prefer-stroke.raised,
.jj-node.highlight.prefer-stroke.highlighted {
  stroke: currentColor;
  fill: var(--jj-graph-bg-color);
}

.jj-node-outline {
  fill: none;
  stroke: none;
}

.jj-node-outline.highlight.raised {
  fill: none;
  stroke: none;
}

.jj-node-outline.highlight.highlighted {
  fill: var(--jj-graph-highlight-color);
  stroke: var(--jj-graph-highlight-color);
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
