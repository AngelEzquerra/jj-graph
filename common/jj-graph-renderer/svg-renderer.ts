// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { type GraphLayout } from "./layout"

type NodeId = number
type EdgeId = number
type ColorId = number

type GraphNodeColumn = number
type GraphNodeColor = number

type Node = {
  id: NodeId
  glyph?: string
}

export type NodeToDraw = {
  id: NodeId
  x: number
  y: number
  c: ColorId
  t?: string
}

export type EdgeToDraw = {
  id: EdgeId
  from: NodeId
  to: NodeId
  d: string
  c: ColorId
}

type CurveType = 'l' | 'c' | 's' | 'q'

export const unit = 24
const centerOffset = unit / 2
const curveType: CurveType = 'q'
const curviness = 0.75
const curveOffset = centerOffset * curviness
const centerMinusCurveOffset = centerOffset - curveOffset

export function genNodesToDraw(nodes: Node[], nodeColumns: GraphNodeColumn[], nodeColors: GraphNodeColor[]): NodeToDraw[] {
  return nodes.map(node => {
    const row = node.id
    const col = nodeColumns[row]

    const circleData = {
      id: node.id,
      x: col * unit + centerOffset,
      y: row * unit + centerOffset,
      c: nodeColors[node.id]!,
      t: node.glyph,
    }
    return circleData
  })
}

const rightTurnStart = [
  `v${centerMinusCurveOffset}`,
  {
    'l': `l${curveOffset},${curveOffset}`,
    'c': `c0,${curveOffset} 0,${curveOffset} ${curveOffset},${curveOffset}`,
    's': `s0,${curveOffset} ${curveOffset},${curveOffset}`,
    'q': `q0,${curveOffset} ${curveOffset},${curveOffset}`,
  }[curveType],
  `h${centerMinusCurveOffset}`
].join(" ")

const leftTurnStart = [
  `v${centerMinusCurveOffset}`,
  {
    'l': `l-${curveOffset},${curveOffset}`,
    'c': `c0,${curveOffset} 0,${curveOffset} -${curveOffset},${curveOffset}`,
    's': `s0,${curveOffset} -${curveOffset},${curveOffset}`,
    'q': `q0,${curveOffset} -${curveOffset},${curveOffset}`,
  }[curveType],
  `h-${centerMinusCurveOffset}`
].join(" ")

const rightTurnEnd = [
  `h${centerMinusCurveOffset}`,
  {
    'l': `l${curveOffset},${curveOffset}`,
    'c': `c${curveOffset},0 ${curveOffset},0 ${curveOffset},${curveOffset}`,
    's': `s${curveOffset},0 ${curveOffset},${curveOffset}`,
    'q': `q${curveOffset},0 ${curveOffset},${curveOffset}`,
  }[curveType],
  `v${centerMinusCurveOffset}`
].join(" ")

const leftTurnEnd = [
  `h-${centerMinusCurveOffset}`,
  {
    'l': `l-${curveOffset},${curveOffset}`,
    'c': `c-${curveOffset},0 -${curveOffset},0 -${curveOffset},${curveOffset}`,
    's': `s-${curveOffset},0 -${curveOffset},${curveOffset}`,
    'q': `q-${curveOffset},0 -${curveOffset},${curveOffset}`,
  }[curveType],
  `v${centerMinusCurveOffset}`
].join(" ")

export function genEdgesToDraw(directedEdgeColors: [NodeId, NodeId, ColorId][], layout: GraphLayout): [ EdgeToDraw[], number ] {
  let maxColumn = 0

  return [ layout.edges.map((edge, idx) => {
    const lineData: string[] = []
    let currentCol: number = -1
    let nextCol: number = -1
    let verticalDist: number = 0

    function drawVertical() {
      if (verticalDist > 0) {
        lineData.push(`v${verticalDist * unit}`)
        verticalDist = 0
      }
    }

    function drawHorizontal() {
      const direction = Math.sign(nextCol - currentCol)
      const horizontalDistance = Math.abs(nextCol - currentCol)

      if (direction > 0) {
        lineData.push(rightTurnStart)
        if (horizontalDistance > 1) {
          lineData.push(`h${(horizontalDistance - 1) * unit}`)
        }
        lineData.push(rightTurnEnd)
      } else if (direction < 0) {
        lineData.push(leftTurnStart)
        if (horizontalDistance > 1) {
          lineData.push(`h-${(horizontalDistance - 1) * unit}`)
        }
        lineData.push(leftTurnEnd)
      }

      currentCol = nextCol
      maxColumn = currentCol > maxColumn ? currentCol : maxColumn;
    }

    for (const p of edge.path) {
      switch (p.type) {
        case "s":
          currentCol = p.column
          nextCol = p.column
          verticalDist = 0
          lineData.push(`M${p.column * unit + centerOffset},${p.row * unit + centerOffset}`)
          break;

        case "c":
          if (nextCol === currentCol) {
            verticalDist += 1
            break;
          }

          drawVertical()
          drawHorizontal()
          break;

        case "b":
          if (nextCol !== currentCol) {
            console.warn("Multiple consecutive branch instructions detected")
            console.warn("edge", edge.desc.from, "->", edge.desc.to, edge.path )
          }
          nextCol = p.column
          break;

        case "e":
          drawVertical()
          drawHorizontal()
          break;
      }
    }

    return {
      id: edge.desc.id,
      from: edge.desc.from,
      to: edge.desc.to,
      d: lineData.join(' '),
      c: directedEdgeColors[idx][2],
    }
  }), maxColumn ]
}
