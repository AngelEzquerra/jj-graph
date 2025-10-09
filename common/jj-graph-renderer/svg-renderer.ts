// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

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

export function genEdgesToDraw(directedEdgeColors: [NodeId, NodeId, ColorId][], nodeColumns: GraphNodeColumn[]): EdgeToDraw[] {
  return directedEdgeColors.map((edge, idx) => {
    const [ fromId, toId, colorIdx ] = edge
    const fromRow = fromId
    const toRow = toId
    const fromCol = nodeColumns[fromRow]
    const toCol = nodeColumns[toRow]

    const direction = Math.sign(toCol - fromCol)
    const horizontalDistance = Math.abs(toCol - fromCol)
    const verticalDistance = toRow - fromRow

    const lineData = (
      toCol === fromCol
        ? (   `M${fromCol * unit + centerOffset},${fromRow * unit + centerOffset}`
            + `L${toCol * unit + centerOffset},${toRow * unit + centerOffset}`
          )
        : direction > 0 ?
            (
                `M${fromCol * unit + centerOffset},${fromRow * unit + centerOffset}`
              + `v${centerMinusCurveOffset}`
              + (useCurves ? (`s0,${curveOffset} ${curveOffset * direction},${curveOffset}`) : (`l${curveOffset * direction},${curveOffset}`))
              + `h${direction * ((horizontalDistance * unit) - (2 * curveOffset))}`
              + (useCurves ? (`s${curveOffset * direction},0 ${curveOffset * direction},${curveOffset}`) : (`l${curveOffset * direction},${curveOffset}`))
              + `v${(verticalDistance * unit) - ((2 * curveOffset) + centerMinusCurveOffset)}`
            )
          :
            (
                `M${fromCol * unit + centerOffset},${fromRow * unit + centerOffset}`
              + `v${(verticalDistance * unit) - ((2 * curveOffset) + centerMinusCurveOffset)}`
              + (useCurves ? (`s0,${curveOffset} ${curveOffset * direction},${curveOffset}`) : (`l${curveOffset * direction},${curveOffset}`))
              + `h${direction * ((horizontalDistance * unit) - (2 * curveOffset))}`
              + (useCurves ? (`s${curveOffset * direction},0 ${curveOffset * direction},${curveOffset}`) : (`l${curveOffset * direction},${curveOffset}`))
              + `v${centerMinusCurveOffset}`
            )
    )
    return {
      id: idx,
      from: fromId,
      to: toId,
      d: lineData,
      c: colorIdx,
    }
  })
}
