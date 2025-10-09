// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

type NodeId = number

type Node = {
  id: NodeId
  parents: NodeId[]
  children: NodeId[]
}

export function genColorMap(nodes: Node[]): [number[], [NodeId, NodeId, number][]] {
  const nodeColors: number[] = []
  const directedEdgeColors: [NodeId, NodeId, number][] = []
  let activeColorIdx = 0
  for (const node of nodes) {
    if (node.children.length === 0) {
      nodeColors[node.id] = activeColorIdx
      activeColorIdx += 1
    } else {
      const children = node.children
      const firstParentChildrenOnly = children.filter(childNodeId => nodes[childNodeId]!.parents[0] === node.id)
      const firstParentChildrenColors = firstParentChildrenOnly.map(childNodeId => nodeColors[childNodeId]!)
      let chosenNodeColor: number
      if (firstParentChildrenColors.length > 0) {
        chosenNodeColor = Math.min(...firstParentChildrenColors)
      } else {
        chosenNodeColor = activeColorIdx
        activeColorIdx += 1
      }

      for (const childNodeId of children) {
        const childColor = nodeColors[childNodeId]
        if (childColor === chosenNodeColor) {
          continue
        }
      }
      nodeColors[node.id] = chosenNodeColor
    }
  }

  for (const node of nodes) {
    const nodeColor = nodeColors[node.id]!
    for (let i = 0; i < node.parents.length; i++) {
      const parentNodeId = node.parents[i]!
      const parentColor = nodeColors[parentNodeId]!
      const branchColor = (i === 0 ? nodeColor : parentColor)

      directedEdgeColors.push([node.id, parentNodeId, branchColor])
    }
  }
  return [ nodeColors, directedEdgeColors ]
}
