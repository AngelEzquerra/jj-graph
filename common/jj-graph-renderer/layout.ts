// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

type NodeId = number

type Node = {
  id: NodeId
  parents: NodeId[]
}

type ParentLineCreationPreference =
  | 'new'
  | 'existing'
  | 'leftmost'

export type NodeColumnGenOptions = {
  parentLineCreation?: ParentLineCreationPreference
}

type EdgeId = number
type EdgeDesc = {
  id: EdgeId
  from: NodeId
  to: NodeId
}
type GraphNodeRow = number
type GraphNodeColumn = number

type GraphEdgeInstructionStart = {
  type: 's',
  column: GraphNodeColumn
  row: GraphNodeRow
}

type GraphEdgeInstructionContinue = {
  type: 'c'
}

type GraphEdgeInstructionBranch = {
  type: 'b'
  column: GraphNodeColumn
}

type GraphEdgeInstructionEnd = {
  type: 'e'
}

type GraphEdgeInstruction =
  | GraphEdgeInstructionStart
  | GraphEdgeInstructionContinue
  | GraphEdgeInstructionBranch
  | GraphEdgeInstructionEnd

type GraphEdgePath = GraphEdgeInstruction[]
type GraphEdge = {
  desc: EdgeDesc
  path: GraphEdgePath
}

export type GraphLayout = {
  nodeColumns: GraphNodeColumn[]
  edges: GraphEdge[]
}

export function genGraphLayout(nodes: Node[], opts: NodeColumnGenOptions = {}): GraphLayout {
  const colActiveEdges: (GraphEdge | null)[] = []
  const nodeColumns: number[] = []
  const edges: GraphEdge[] = []

  const {
    parentLineCreation = 'new',
  } = opts

  for (const node of nodes) {
    const nodeId = node.id
    let colNumber: number = -1 // Haven't placed the node in the graph yet

    // Find if current node fulfills a parent line
    colNumber = colActiveEdges.findIndex(colActiveEdge => colActiveEdge?.desc.to === nodeId)

    // If there are no parent lines, see if there is an empty column
    if (colNumber < 0) {
      colNumber = colActiveEdges.findIndex(colActiveEdge => colActiveEdge === null)
    }

    // All lines are already occupied. Create a new line
    if (colNumber < 0) {
      colActiveEdges.push(null)
      colNumber = colActiveEdges.length - 1
    }

    // Fulfill all matching parent lines
    for (let i = 0; i < colActiveEdges.length; i++) {
      const colActiveEdge = colActiveEdges[i]
      if (colActiveEdge?.desc.to === nodeId) {
        const fromCol = i
        const toCol = colNumber

        const edgePath = colActiveEdge.path
        if (fromCol !== toCol) {
          edgePath.push({
            type: 'b',
            column: toCol
          })
        } else {
          edgePath.push({ type: 'c' })
        }
        edgePath.push({ type: 'e' })

        colActiveEdges[i] = null
      }
    }

    // Propagate all non-empty edges
    for (const colActiveEdge of colActiveEdges) {
      if (colActiveEdge !== null) {
        colActiveEdge.path.push({ type: 'c' })
      }
    }

    // Create parent lines for parents of this node
    for (const parentNodeId of node.parents) {
      const parentEdge: GraphEdge = {
        desc: {
          id: edges.length,
          from: nodeId,
          to: parentNodeId,
        },
        path: [ { type: 's', column: colNumber, row: nodeId } ]
      }
      edges.push(parentEdge)

      const fromCol = colNumber
      let toCol = colActiveEdges.findIndex(colActiveEdge => colActiveEdge === null)
      if (toCol < 0) {
        colActiveEdges.push(null)
        toCol = colActiveEdges.length - 1
      }

      if (fromCol !== toCol) {
        parentEdge.path.push({
          type: 'b',
          column: toCol
        })
      }

      colActiveEdges[toCol] = parentEdge
    }

    nodeColumns.push(colNumber)
  }
  return {
    nodeColumns,
    edges,
  }
}
