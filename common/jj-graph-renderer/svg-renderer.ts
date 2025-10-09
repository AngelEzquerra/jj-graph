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
}

export type NodeToDraw = {
  id: NodeId
  x: number
  y: number
  c: ColorId
}

export type EdgeToDraw = {
  id: EdgeId
  from: NodeId
  to: NodeId
  d: string
  c: ColorId
}

export const unit = 24
const centerOffset = unit / 2
const useCurves = true
const curviness = 0.5
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
      c: nodeColors[node.id]!
    }
    return circleData
  })
}

const rightTurnStart = [
  `v${centerMinusCurveOffset}`,
  useCurves ? (`s0,${curveOffset} ${curveOffset},${curveOffset}`) : (`l${curveOffset},${curveOffset}`),
  `h${centerMinusCurveOffset}`
].join(" ")

const leftTurnStart = [
  `v${centerMinusCurveOffset}`,
  useCurves ? (`s0,${curveOffset} -${curveOffset},${curveOffset}`) : (`l-${curveOffset},${curveOffset}`),
  `h-${centerMinusCurveOffset}`
].join(" ")

const rightTurnEnd = [
  `h${centerMinusCurveOffset}`,
  useCurves ? (`s${curveOffset},0 ${curveOffset},${curveOffset}`) : (`l${curveOffset},${curveOffset}`),
  `v${centerMinusCurveOffset}`
].join(" ")

const leftTurnEnd = [
  `h-${centerMinusCurveOffset}`,
  useCurves ? (`s-${curveOffset},0 -${curveOffset},${curveOffset}`) : (`l-${curveOffset},${curveOffset}`),
  `v${centerMinusCurveOffset}`
].join(" ")

export function genEdgesToDraw(directedEdgeColors: [NodeId, NodeId, ColorId][], layout: GraphLayout): [ EdgeToDraw[], number ] {
  let maxColumn = 0

  return [ layout.edges.map((edge, idx) => {
    const lineData: string[] = []
    let currentCol: number = -1
    let verticalDist: number = 0

    for (const p of edge.path) {
      switch (p.type) {
        case "s":
          currentCol = p.column
          maxColumn = currentCol > maxColumn ? currentCol : maxColumn;
          verticalDist = 0
          lineData.push(`M${p.column * unit + centerOffset},${p.row * unit + centerOffset}`)
          break;

        case "c":
          verticalDist += 1
          break;

        case "b":
          const toCol = p.column
          const direction = Math.sign(toCol - currentCol)
          const horizontalDistance = Math.abs(toCol - currentCol)
          if (direction === 0) {
            verticalDist += 1
            break;
          }

          if (verticalDist > 0) {
            lineData.push(`v${verticalDist * unit}`)
          }
          verticalDist = -1

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

          currentCol = toCol
          maxColumn = currentCol > maxColumn ? currentCol : maxColumn;
          break;

        case "e":
          if (verticalDist > 0) {
            lineData.push(`v${verticalDist * unit}`)
            verticalDist = 0
          }
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
