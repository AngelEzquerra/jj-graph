// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { shallowRef, triggerRef } from 'vue'
import { defineStore } from 'pinia'

export type GraphSourceType = 'inline' | 'repo'
export type GraphSource = { type: GraphSourceType, value: string }
export type KnownGraphSources = { [key in GraphSourceType]: {label: string, value: string }[] }

export const useRepoSourceStore = defineStore('repoSource', () => {
  const graphSource = shallowRef<GraphSource>()

  const knownGraphSources = shallowRef<KnownGraphSources>({
    "inline": [
      'wikipedia-1-order-1',
      'wikipedia-1-order-2',
      'wikipedia-1-order-3',
      'handcrafted-1-order-1',
    ].map(x => ({ label: x, value: x })),
    "repo": [ ]
  })

  function updateRepoList(repoPaths: string[]) {
    knownGraphSources.value.repo = repoPaths.map(path => ({
      label: (path.split(/[\/\\]/).reverse())[0] ?? path,
      value: path,
    }))

    if (graphSource.value === undefined && repoPaths[0]) {
      graphSource.value = { type: 'repo', value: repoPaths[0] }
    }

    triggerRef(knownGraphSources)
  }

  return { graphSource, knownGraphSources, updateRepoList }
})

type NodeId = number
type GraphNode<NodeData> = {
  id: NodeId
  data?: NodeData
  parents: NodeId[]
  children: NodeId[]
}

type DirectedEdge = [NodeId, NodeId]
type DirectedEdges = DirectedEdge[]

type Graph<NodeData> = {
  nodes: GraphNode<NodeData>[]
  directedEdges: DirectedEdges
}

const wikiGraph1Order1 = [ 5, 7, 3, 11, 8, 10, 9, 2 ]
const wikiGraph1Order2 = [ 5, 7, 11, 3, 8, 10, 9, 2 ]
const wikiGraph1Order3 = [ 7, 5, 11, 3, 8, 10, 9, 2 ]
const wikiGraph1Order4 = [ 5, 3, 7, 11, 8, 10, 9, 2 ]
const wikiGraph1DirectedEdges: [number, number][] = [
  [  5, 11 ],
  [  7, 11 ],
  [  7,  8 ],
  [  3,  8 ],
  [  3, 10 ],
  [ 11,  2 ],
  [ 11,  9 ],
  [ 11, 10 ],
  [  8,  9 ],
]

const handcrafted1Order1 = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M' ]
const handcrafted1DirectedEdges: [string, string][] = [
  [ 'A', 'C' ],
  [ 'B', 'C' ],
  [ 'C', 'D' ],
  [ 'C', 'E' ],
  [ 'D', 'H' ],
  [ 'E', 'F' ],
  [ 'E', 'G' ],
  [ 'F', 'L' ],
  [ 'G', 'K' ],
  [ 'H', 'I' ],
  [ 'H', 'J' ],
  [ 'I', 'L' ],
  [ 'J', 'K' ],
  [ 'K', 'M' ],
  [ 'L', 'M' ],
]

function generateInOutGraph<NodeData = undefined>(inputNodes: NodeData[], directedEdgesData: [NodeData, NodeData][]): Graph<NodeData> {
  const nodes: GraphNode<NodeData>[] = []
  const directedEdges: DirectedEdges = []

  for (let i = 0; i < inputNodes.length; i++) {
    const node = {
      id: i,
      data: inputNodes[i],
      parents: [],
      children: [],
    }
    nodes.push(node)
  }

  for (const directedEdge of directedEdgesData) {
    const child = directedEdge[0]
    const parent = directedEdge[1]

    const childNodeId = nodes.findIndex(n => n.data === child)
    const childNode = nodes[childNodeId]!
    const parentNodeId = nodes.findIndex(n => n.data === parent)
    const parentNode = nodes[parentNodeId]!

    childNode.parents.push(parentNodeId)
    parentNode.children.push(childNodeId)
    directedEdges.push([childNodeId, parentNodeId])
  }

  return {
    nodes,
    directedEdges,
  }
}

export function generateInlineGraph(graphSource: string) {
  switch (graphSource) {
    case "wikipedia-1-order-1":
      return generateInOutGraph(wikiGraph1Order1, wikiGraph1DirectedEdges)
    case "wikipedia-1-order-2":
      return generateInOutGraph(wikiGraph1Order2, wikiGraph1DirectedEdges)
    case "wikipedia-1-order-3":
      return generateInOutGraph(wikiGraph1Order3, wikiGraph1DirectedEdges)
    case "wikipedia-1-order-4":
      return generateInOutGraph(wikiGraph1Order4, wikiGraph1DirectedEdges)
    case "handcrafted-1-order-1":
      return generateInOutGraph(handcrafted1Order1, handcrafted1DirectedEdges)
    default:
      return generateInOutGraph([], [])
  }
}
