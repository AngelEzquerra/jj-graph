// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import {
  genNodeColumns,
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
  const nodeColumns = genNodeColumns(nodes, opts)
  const [ nodeColors, directedEdgeColors ] = genColorMap(nodes)
  const nodesToDraw = genNodesToDraw(nodes, nodeColumns, nodeColors)
  const edgesToDraw = genEdgesToDraw(directedEdgeColors, nodeColumns)
  const maxNodeColumn = nodeColumns.reduce((a, b) => Math.max(a, b), 0)
  return [ maxNodeColumn, nodesToDraw, edgesToDraw ]
}
