// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import {
  genGraphLayout,
  type NodeColumnGenOptions,
} from "./layout"
import { genColorMap } from "./color"
import {
  genNodesToDraw,
  genEdgesToDraw,
  type NodeToDraw,
  type EdgeToDraw,
} from "./svg-renderer"

type GraphNodeColumn = number

type NodeId = number
type Node = {
  id: NodeId,
  parents: NodeId[]
  children: NodeId[]
}

type RenderOutput = [ GraphNodeColumn, NodeToDraw[], EdgeToDraw[] ]

export function renderLogic(nodes: Node[], opts?: NodeColumnGenOptions): RenderOutput {
  const layout = genGraphLayout(nodes, opts)
  const [ nodeColors, directedEdgeColors ] = genColorMap(nodes)
  const nodesToDraw = genNodesToDraw(nodes, layout.nodeColumns, nodeColors)
  const [ edgesToDraw, maxEdgeColumn ] = genEdgesToDraw(directedEdgeColors, layout)
  const maxNodeColumn = layout.nodeColumns.reduce((a, b) => Math.max(a, b), 0)
  const maxColumn = Math.max(maxNodeColumn, maxEdgeColumn)
  return [ maxColumn, nodesToDraw, edgesToDraw ]
}
