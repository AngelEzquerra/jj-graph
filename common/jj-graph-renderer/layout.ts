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

export function genNodeColumns(nodes: Node[], opts: NodeColumnGenOptions = {}): number[] {
  const colActiveParentNodeIds: (NodeId | null)[] = []
  const nodeColumns: number[] = []
  const {
    parentLineCreation = 'new',
  } = opts

  for (const node of nodes) {
    const nodeId = node.id
    let colNumber: number = -1 // Haven't placed the node in the graph yet

    // Find if current node fulfills a parent line
    colNumber = colActiveParentNodeIds.findIndex(colActiveParentNodeId => colActiveParentNodeId === nodeId)

    // If there are no parent lines, see if there is an empty column
    if (colNumber < 0) {
      colNumber = colActiveParentNodeIds.findIndex(colActiveParentNodeId => colActiveParentNodeId === null)
    }

    // All lines are already occupied. Create a new line
    if (colNumber < 0) {
      colActiveParentNodeIds.push(null)
      colNumber = colActiveParentNodeIds.length - 1
    }

    // Fulfill all matching parent lines
    for (let i = 0; i < colActiveParentNodeIds.length; i++) {
      if (colActiveParentNodeIds[i] === nodeId) {
        colActiveParentNodeIds[i] = null
      }
    }

    // Create parent lines for parents of this node
    let checkColActiveParentNodeIdx = 0
    parentLoop: for (const parentId of node.parents) {
      // Get existing parent line if any
      const firstExistingParentNodeIdx = colActiveParentNodeIds.findIndex(colActiveParentNodeId => colActiveParentNodeId === parentId)
      let continueParentLoop = false
      while (checkColActiveParentNodeIdx < colActiveParentNodeIds.length) {
        if (colActiveParentNodeIds[checkColActiveParentNodeIdx] === null) {
          // Match existing parent line if it makes sense to do so
          if (firstExistingParentNodeIdx >= 0) {
            if (parentLineCreation === 'leftmost') {
              if (firstExistingParentNodeIdx < checkColActiveParentNodeIdx) {
                continue parentLoop
              }
            } else if (parentLineCreation === 'existing') {
              continue parentLoop
            }
          }
          colActiveParentNodeIds[checkColActiveParentNodeIdx] = parentId
          continueParentLoop = true
        }
        checkColActiveParentNodeIdx++
        if (continueParentLoop) {
          continue parentLoop
        }
      }

      // No empty parent lines available. Create a new line
      colActiveParentNodeIds.push(parentId)
    }

    nodeColumns.push(colNumber)
  }
  return nodeColumns
}
