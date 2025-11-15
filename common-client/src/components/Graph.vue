<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script lang="ts" setup>
import NodeDescription from './NodeDescription.vue'
import { computed, inject, ref, watch, watchEffect } from 'vue'
import { renderLogic } from '@common/jj-graph-renderer'
import { unit } from '@common/jj-graph-renderer/svg-renderer'
import { type JJCommitGraphCommitNode, type JJCommitGraphNodeData } from '@common/jj-graph-parser/commit-graph-parser'
import GraphLayer from './GraphLayer.vue'
import CommitDetails from './commit-details/CommitDetails.vue'
import { type NodeColumnGenOptions } from '@common/jj-graph-renderer/layout'
import CommitOverview from './commit-overview/CommitOverview.vue'
import { GRAPH_INTERACTION_CTX_IK } from '@common-client/providers/graph-interaction-ctx-provider'

type NodeId = number
type EdgeId = number
type GraphNode<NodeData> = {
  id: NodeId
  data?: NodeData
  parents: NodeId[]
  children: NodeId[]
}

export type GraphMode =
  | 'normal'
  | 'modalSelectSingle'
  | 'modalSelectMultiple'

type ThisComponentProps = {
  commits: GraphNode<JJCommitGraphNodeData>[]
  opts: NodeColumnGenOptions
  mode: GraphMode
}

type ThisComponentEmits = {
  (e: 'commitSelection', commits: JJCommitGraphCommitNode[]): void
}

const { commits, opts, mode } = defineProps<ThisComponentProps>()
const emit = defineEmits<ThisComponentEmits>()

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
const graphHighlightedNodeIds = computedL('graphHighlightedNodeIds', () => {
  const hNodeId = highlightedNodeId.value
  const hEdgeId = highlightedEdgeId.value
  const eToDraw = edgesToDraw.value

  if (hNodeId !== undefined) {
    return [ hNodeId ]
  }
  if (hEdgeId !== undefined) {
    const hEdge = eToDraw[hEdgeId]
    if (hEdge !== undefined) {
      return [ hEdge.from, hEdge.to ]
    }
  }
  return []
})

const graphRaisedNodeIds = computedL('graphRaisedNodeIds', () => {
  const hNodeId = highlightedNodeId.value
  const eToDraw = edgesToDraw.value

  if (hNodeId !== undefined) {
    return eToDraw.filter(e => e.from === hNodeId || e.to === hNodeId).map(e => e.from === hNodeId ? e.to : e.from)
  }
  return emptyNodeIdSet
})

const emptyEdgeIdSet = new Set<number>()
const graphHighlightedEdges = computedL('graphHighlightedEdges', () => {
  const hNodeId = highlightedNodeId.value
  const hEdgeId = highlightedEdgeId.value
  const eToDraw = edgesToDraw.value
  if (hEdgeId === undefined && hNodeId === undefined) {
    return emptyEdgeIdSet
  } else if (hNodeId === undefined) {
    return new Set([ hEdgeId! ])
  } else {
    return new Set(eToDraw.map((e, i) => [ e, i ] as const).filter(([ e, i ]) => e.from === hNodeId || e.to === hNodeId).map(([ e, i ]) => i))
  }
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

const selectedNodeIds = ref<NodeId[]>([])

const commitDetailsPreviewNodeId = ref<NodeId>()
const commitDetailsPinnedNodeIds = ref<NodeId[]>([])

function closeCommitDetails(nodeId: NodeId) {
  const pinnedNodeIds = commitDetailsPinnedNodeIds.value
  const indexOfNodeId = pinnedNodeIds.indexOf(nodeId)
  if (indexOfNodeId >= 0) {
    pinnedNodeIds.splice(indexOfNodeId, 1)
  } else if (commitDetailsPreviewNodeId.value === nodeId) {
    commitDetailsPreviewNodeId.value = undefined
  }
}

function toggleNodeSelection(nodeId: NodeId, multiple: boolean) {
  const multipleAllowed = mode !== 'modalSelectSingle'
  const snIds = selectedNodeIds.value
  const indexOfNodeId = snIds.indexOf(nodeId)
  if (indexOfNodeId >= 0) {
    if (multiple && multipleAllowed) {
      snIds.splice(indexOfNodeId, 1)
    }
  } else {
    if (multiple && multipleAllowed) {
      snIds.push(nodeId)
    } else {
      snIds.splice(0, Infinity, nodeId)
    }
  }
}

function handleEscInGraph() {
  clearNodeSelection()
  closeCommitDetailsPreview()
}

function clearNodeSelection() {
  const snIds = selectedNodeIds.value
  snIds.splice(0, Infinity)
}

function openCommitDetailsOrBringToFront(nodeId: NodeId) {
  const pinnedNodeIds = commitDetailsPinnedNodeIds.value
  const indexOfNodeId = pinnedNodeIds.indexOf(nodeId)
  if (indexOfNodeId >= 0) {
    // A pinned node. Bring it to the front
    pinnedNodeIds.splice(indexOfNodeId, 1)
    pinnedNodeIds.push(nodeId)
    commitDetailsPreviewNodeId.value = undefined
  } else {
    // Just preview it
    commitDetailsPreviewNodeId.value = nodeId
  }
}

function closeCommitDetailsPreview() {
  commitDetailsPreviewNodeId.value = undefined
}

function pinCommitDetails(nodeId: NodeId) {
  const pinnedNodeIds = commitDetailsPinnedNodeIds.value
  const indexOfNodeId = pinnedNodeIds.indexOf(nodeId)
  if (indexOfNodeId >= 0) {
    pinnedNodeIds.splice(indexOfNodeId, 1)
  }
  pinnedNodeIds.push(nodeId)
  commitDetailsPreviewNodeId.value = undefined
}

function toggleCommitDetailsPinned(nodeId: NodeId) {
  const pinnedNodeIds = commitDetailsPinnedNodeIds.value
  const indexOfNodeId = pinnedNodeIds.indexOf(nodeId)
  if (indexOfNodeId >= 0) {
    pinnedNodeIds.splice(indexOfNodeId, 1)
  } else {
    pinnedNodeIds.push(nodeId)
  }
  commitDetailsPreviewNodeId.value = undefined
}

function toggleCommitDetailsPreview(nodeId: NodeId) {
  const pinnedNodeIds = commitDetailsPinnedNodeIds.value
  const previewNodeId = commitDetailsPreviewNodeId.value
  const indexOfNodeId = pinnedNodeIds.indexOf(nodeId)
  if (indexOfNodeId >= 0) {
    // A pinned node. Bring it to the front
    pinnedNodeIds.splice(indexOfNodeId, 1)
    pinnedNodeIds.push(nodeId)
    commitDetailsPreviewNodeId.value = undefined
  } else {
    // Toggle the preview
    if (previewNodeId === nodeId) {
      commitDetailsPreviewNodeId.value = undefined
    } else {
      commitDetailsPreviewNodeId.value = nodeId
    }
  }
}

const selectedNodesToDraw = computedL('selectedNodesToDraw', () => {
  const snPinnedIds = commitDetailsPinnedNodeIds.value
  const snPreviewId = commitDetailsPreviewNodeId.value
  const ntd = nodesToDraw.value
  const snToDraw = snPinnedIds.map(id => ({
    id: id,
    y: ntd[id]!.y,
    c: ntd[id]!.c,
    data: commits[id]!.data,
    pinned: true,
  }))
  if (snPreviewId !== undefined && !snPinnedIds.includes(snPreviewId)) {
    snToDraw.push({
      id: snPreviewId,
      y: ntd[snPreviewId]!.y,
      c: ntd[snPreviewId]!.c,
      data: commits[snPreviewId]!.data,
      pinned: false,
    })
  }
  return snToDraw
})

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

const commitDetailsWidth = 1000
const commitDetailsHeight = 250
const commitDetailsLeftOffset = 35

function commitDetailsPolygon(y: number) {
  // O - origin, L - left, R - right, T - top, B - bottom
  const xO = 0
  const xL = commitDetailsLeftOffset
  const xR = commitDetailsLeftOffset + commitDetailsWidth
  const yO = y
  const yT = y - (commitDetailsHeight / 2)
  const yB = y + (commitDetailsHeight / 2)
  return `${xO},${yO} ${xL},${yT} ${xR},${yT} ${xR},${yB} ${xL},${yB}`
}

function commitIdFromNodeData(data?: JJCommitGraphNodeData) {
  switch (data?.type) {
    case 'commit':
    case 'commitId':
      return data.commitId
    default:
      return undefined
  }
}

const interactionCtx = inject(GRAPH_INTERACTION_CTX_IK)!

const highlightedBeforeAfterId = computed(() => {
  const hEdgeId = highlightedEdgeId.value
  const eToDraw = edgesToDraw.value

  if (hEdgeId === undefined) {
    return undefined
  }

  const hEdge = eToDraw[hEdgeId]
  if (hEdge === undefined) {
    return undefined
  }

  const fromNode = commits[hEdge.from]
  const toNode = commits[hEdge.to]

  if (fromNode?.data?.type !== 'commit' || toNode?.data?.type !== 'commit') {
    return undefined
  }

  return { before: fromNode.data, after: toNode.data }
})

function setContextMenu() {
  const sCommits = selectedCommits.value
  const hNodeId = highlightedNodeId.value
  const hNodeData = commits[hNodeId]?.data
  interactionCtx.setBeforeAfterContext(highlightedBeforeAfterId.value)
  if (sCommits.length === 0 && hNodeData?.type === 'commit') {
    interactionCtx.setCommitDataContext([hNodeData])
  } else {
    interactionCtx.setCommitDataContext(sCommits)
  }
}

const selectedCommits = computed(() => {
  const snIds = selectedNodeIds.value
  return snIds.map(x => commits[x]!.data).filter(nodeData => nodeData?.type === 'commit')
})

watch(selectedCommits, (value) => {
  emit('commitSelection', value)
})

const graphWidth = computed(() => unit * graphColumnCount.value)

</script>

<template>
  <div class="flex graph-vars">
    <div class="grid-layout user-select-none flex-grow focus:outline-none" tabindex="0" @contextmenu="setContextMenu()" @keyup.esc="handleEscInGraph()">
      <div class="px-2 grid-header">Graph</div>
      <div class="px-2 grid-header">Description</div>

      <div class="px-2 grid-header">Date</div>
      <div class="px-2 grid-header">Author</div>
      <div class="px-2 grid-header">Change</div>
      <div class="px-2 grid-header">Commit</div>
      <div class="graph-grid-container">
        <div class="display-contents">
          <CommitOverview
            v-for="(node, r) in commits"
            v-memo="[ commits, nodesToDraw, highlightedNodeId === r, selectedNodeIds.includes(r) ]"
            :key="r"
            :node-data="node.data!"
            :color="colorMap[nodesToDraw[r]!.c % colorMap.length]!"
            :highlighted="highlightedNodeId === r"
            :selected="selectedNodeIds.includes(r)"
            @mouseenter="highlightNode(node.id)"
            @mouseleave="removeNodeHighlight"
            @select:single="toggleNodeSelection(node.id, false)"
            @select:multiple="toggleNodeSelection(node.id, true)"
            @commit:pin="toggleCommitDetailsPinned(node.id)"
            @commit:preview="toggleCommitDetailsPreview(node.id)"
            @commit:closepreview="closeCommitDetailsPreview()"
          />
        </div>
        <div class="graph-container pointer-events-none" @contextmenu="clearNodeSelection()">
          <svg xmlns="http://www.w3.org/2000/svg" class="graph-svg pointer-events-all" :width="graphWidth" :height="unit * commits.length">
            <GraphLayer
              :nodes-to-draw="nodesToDraw"
              :edges-to-draw="edgesToDraw"
              :color-map="colorMap"
              :highlighted-node-ids="graphHighlightedNodeIds"
              :raised-node-ids="graphRaisedNodeIds"
              :highlighted-edges="graphHighlightedEdges"
              @mouse-enter-node="highlightNode"
              @mouse-leave-node="removeNodeHighlight"
              @mouse-enter-edge="highlightEdge"
              @mouse-leave-edge="removeEdgeHighlight"
            />
          </svg>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="commit-details-svg pointer-events-none" :height="unit * commits.length" :width="commitDetailsWidth" @contextmenu.stop>
          <g v-for="sn in selectedNodesToDraw" :key="sn.id" class="shadow pointer-events-all" @click="openCommitDetailsOrBringToFront(sn.id)">
            <polygon :points="commitDetailsPolygon(sn.y)" class="commit-details-polygon" stroke-width="2" :stroke="colorMap[sn.c % colorMap.length]" stroke-linejoin="round"></polygon>
            <foreignObject :x="commitDetailsLeftOffset" :y="sn.y - (commitDetailsHeight / 2)" :width="commitDetailsWidth" :height="commitDetailsHeight">
              <div xmlns="http://www.w3.org/1999/xhtml" style="height: inherit;">
                <CommitDetails :node-data="sn.data" :pinned="sn.pinned" @close="closeCommitDetails(sn.id)" @pin="pinCommitDetails(sn.id)" />
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>
    </div>
  </div>

</template>

<style scoped>

.pointer-events-all {
  pointer-events: all;
}

.commit-details-svg {
  position: absolute;
  top: 0;
  /* left: 0; */
  bottom: 0;
  right: 200px;

  overflow: visible;

  z-index: 2;
}

.commit-details-polygon {
  fill: var(--ui-bg);
}

.shadow {
  filter: drop-shadow(0px 0px 10px black);
}

.graph-svg {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  /* z-index: -1; */
}

.graph-vars {
  --max-graph-width: 200px;
  --min-graph-width: 75px;

  --jj-graph-bg-color: var(--ui-bg);
  --jj-graph-highlight-color: var(--ui-bg-inverted)
}

.graph-grid-container {
  position: relative;
}

.user-select-none {
  user-select: none;
}

.graph-container {
  position: absolute;
  top: 0;
  bottom: 0;

  width: var(--max-graph-width);
  overflow-x: auto;
  overflow-y: hidden; /* Why do we need this workaround. Let's see if we can fix it sometime */
}

.node-description {
  display: flex;
  height: calc(v-bind('unit') * 1px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  /* margin-left: var(--graph-width); */
  align-items: center;

  /* width: 600px; */
}

.pointer-events-all {
  pointer-events: all;
}

.pointer-events-none {
  pointer-events: none;
}

.px-2 {
  padding-inline: 0.5rem;
}

.grid-header {
  font-weight: bold;

  border-block: 1px solid rgba(128, 128, 128, 0.5);
  padding: 6px 12px;
}

.grid-header {
  position: sticky;
  top: 0;

  background-color: var(--ui-bg);

  z-index: 1;
}

.flex {
  display: flex;
}

.flex-grow {
  flex-grow: 1;
}

.grid-layout {
  display: grid;

  grid-template-columns:  max(min(var(--max-graph-width), calc(v-bind('graphWidth') * 1px)), var(--min-graph-width)) 5fr repeat(2, 1fr) max-content max-content;
}

.graph-grid-container {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  grid-auto-rows: calc(v-bind('unit') * 1px);
}

.display-contents {
  display: contents;
}

</style>
