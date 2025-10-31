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
import GraphLayer from './GraphLayer.vue'
import CommitDetails from './commit-details/CommitDetails.vue'
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
const highlightedNodeIdComputed = computedL('highlightedNodeIdComputed', () => {
  const hNodeId = highlightedNodeId.value
  const hEdgeId = highlightedEdgeId.value
  const eToDraw = edgesToDraw.value

  if (hNodeId !== undefined) {
    return hNodeId
  }
  if (hEdgeId !== undefined) {
    const hEdge = eToDraw[hEdgeId]
    if (hEdge !== undefined) {
      return hEdge.from
    }
  }
})
const highlightedParentNodeIds = computedL('highlightedParentNodeIds', () => {
  const hNodeId = highlightedNodeId.value
  const hEdgeId = highlightedEdgeId.value
  const eToDraw = edgesToDraw.value
  if (hNodeId === undefined && hEdgeId === undefined) {
    return emptyNodeIdSet
  } else if (hNodeId === undefined) {
    const hEdge = eToDraw[hEdgeId!]
    if (hEdge === undefined) {
      return emptyNodeIdSet
    }
    return [ hEdge.to ]
  } else {
    const hNode = commits[hNodeId]
    if (hNode === undefined) {
      return emptyNodeIdSet
    }
    return hNode.parents
  }
})

const emptyEdgeIdSet = new Set<number>()
const highlightedEdges = computedL('highlightedEdges', () => {
  const hNodeId = highlightedNodeId.value
  const hEdgeId = highlightedEdgeId.value
  const eToDraw = edgesToDraw.value
  if (hNodeId === undefined && hEdgeId === undefined) {
    return emptyEdgeIdSet
  } else if (hNodeId === undefined) {
    return new Set([ hEdgeId! ])
  } else {
    return new Set(eToDraw.map((e, i) => [ e, i ] as const).filter(([ e, i ]) => e.from === hNodeId).map(([ e, i ]) => i))
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

const selectedPreviewNodeId = ref<NodeId>()
const selectedPinnedNodeIds = ref<NodeId[]>([])

function closeCommitDetails(nodeId: NodeId) {
  const snIds = selectedPinnedNodeIds.value
  const indexOfNodeId = snIds.indexOf(nodeId)
  if (indexOfNodeId >= 0) {
    snIds.splice(indexOfNodeId, 1)
  } else if (selectedPreviewNodeId.value === nodeId) {
    selectedPreviewNodeId.value = undefined
  }
}

function selectNodeAndBringToFront(nodeId: NodeId) {
  const snIds = selectedPinnedNodeIds.value
  const indexOfNodeId = snIds.indexOf(nodeId)
  if (indexOfNodeId >= 0) {
    // A pinned node. Bring it to the front
    snIds.splice(indexOfNodeId, 1)
    snIds.push(nodeId)
    selectedPreviewNodeId.value = undefined
  } else {
    // Just preview it
    selectedPreviewNodeId.value = nodeId
  }
}

function pinCommitDetails(nodeId: NodeId) {
  const snIds = selectedPinnedNodeIds.value
  const indexOfNodeId = snIds.indexOf(nodeId)
  if (indexOfNodeId >= 0) {
    snIds.splice(indexOfNodeId, 1)
  }
  snIds.push(nodeId)
  selectedPreviewNodeId.value = undefined
}

const selectedNodesToDraw = computedL('selectedNodesToDraw', () => {
  const snPinnedIds = selectedPinnedNodeIds.value
  const snPreviewId = selectedPreviewNodeId.value
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

</script>

<template>
  <div class="flex">
    <table class="table-layout table-border user-select-none flex-grow">
      <thead>
        <tr>
          <th class="px-2 graph-table-header">Graph</th>
          <th class="px-2 graph-table-header">Description</th>

          <th class="px-2 graph-table-header">Date</th>
          <th class="px-2 graph-table-header">Author</th>
          <th class="px-2 graph-table-header">Change</th>
          <th class="px-2 graph-table-header">Commit</th>
        </tr>
      </thead>
      <tbody class="graph-grid-container">
        <tr v-for="(node, r) in commits" :key="r" class="graph-row" @mouseenter="highlightNode(node.id)" @mouseleave="removeNodeHighlight" @click="selectNodeAndBringToFront(node.id)">
          <td class="px-2"></td>
          <td class="px-2 node-description"><NodeDescription :node-data="node.data" :color="colorMap[nodesToDraw[r]!.c % colorMap.length]" /></td>
          <td class="px-2"><pre>{{ node.data?.type === 'commit' ? node.data.author.timestamp : '' }}</pre></td>
          <td class="px-2"><span>{{ node.data?.type === 'commit' ? node.data.author.name : '' }}</span></td>
          <td class="px-2"><pre>{{ node.data?.type === 'commit' ? node.data.changeId : '' }}</pre></td>
          <td class="px-2"><pre>{{ node.data?.type === 'commit' ? node.data.commitId : '' }}</pre></td>
        </tr>
        <div class="graph-container">
          <svg xmlns="http://www.w3.org/2000/svg" class="graph-svg" :width="unit * graphColumnCount" :height="unit * commits.length">
            <GraphLayer
              :nodes-to-draw="nodesToDraw"
              :edges-to-draw="edgesToDraw"
              :color-map="colorMap"
              :highlighted-node-id="highlightedNodeIdComputed"
              :highlighted-parent-node-ids="highlightedParentNodeIds"
              :highlighted-edges="highlightedEdges"
              @mouse-enter-node="highlightNode"
              @mouse-leave-node="removeNodeHighlight"
              @mouse-enter-edge="highlightEdge"
              @mouse-leave-edge="removeEdgeHighlight"
            />
          </svg>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="commit-details-svg pointer-events-none" :height="unit * commits.length">
          <g v-for="sn in selectedNodesToDraw" :key="sn.id" class="shadow pointer-events-all" @click="selectNodeAndBringToFront(sn.id)">
            <polygon :points="commitDetailsPolygon(sn.y)" stroke-width="2" fill="black" :stroke="colorMap[sn.c % colorMap.length]" stroke-linejoin="round"></polygon>
            <foreignObject :x="commitDetailsLeftOffset" :y="sn.y - (commitDetailsHeight / 2)" :width="commitDetailsWidth" :height="commitDetailsHeight">
              <div xmlns="http://www.w3.org/1999/xhtml" style="height: inherit;">
                <CommitDetails :node-data="sn.data" :pinned="sn.pinned" @close="closeCommitDetails(sn.id)" @pin="pinCommitDetails(sn.id)" />
              </div>
            </foreignObject>
          </g>
        </svg>
      </tbody>
    </table>
  </div>

</template>

<style scoped>

.commit-details-svg {
  position: absolute;
  top: 0;
  left: 600px;
  bottom: 0;
  right: 0;

  overflow: visible;

  z-index: 2;
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

.graph-grid-container {
  position: relative;

  --graph-width: 200px;
  --content-width: 400px;
}

.table-layout {
  border-spacing: 0;
  border-collapse: collapse;
  /* table-layout: fixed; */
  /* width: calc(var(--graph-width) + var(--content-width)); */
}

.user-select-none {
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

.graph-table-header {
  font-weight: bold;

  border: 1px solid rgba(128, 128, 128, 0.5);
}

.flex {
  display: flex;
}

.flex-grow {
  flex-grow: 1;
}

</style>
