// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

// TODO: Abstract out the parser for box drawing - curved and square
//
// TODO: Abstract out the parser for ascii drawing as well
//
// TODO: See if we can support user-provided parameters for
//       graphTerminationRegex and node glyphs. Right now,
//       we support only commit ids, or json objects, or
//       "(elided revisions)" as graph termination symbols

type JJGraphRow = number
type JJGraphColumn = number

export type JJGraphNode = {
  row: JJGraphRow
  originalRow: JJGraphRow
  column: JJGraphColumn
  originalColumn: JJGraphColumn
  parents: Set<JJGraphRow>
  children: Set<JJGraphRow>
  data: string
  nodeGlyph: string
}

export type JJGraphParseOutput = {
  nodes: JJGraphNode[]
  originalRowToNodeMap: Map<JJGraphRow, JJGraphNode>
}

export type JJGraphParser = {
  parseJJGraph: (jjGraph: string) => JJGraphParseOutput
}

export function createJJGraphParserCurved(): JJGraphParser {
  const graphGlyphs = [
    " ", // Space
    "─", // Horizontal
    "│", // Parent
    "╷", // Ancestor
    "╯", // MergeLeft
    "╰", // MergeRight
    "┴", // MergeBoth
    "╮", // ForkLeft
    "╭", // ForkRight
    "┬", // ForkBoth
    "┤", // JoinLeft
    "├", // JoinRight
    "┼", // JoinBoth
  ]

  const childGraphGlyphs = [
    "│", // Parent
    "╯", // MergeLeft
    "╰", // MergeRight
    "┴", // MergeBoth
    "┤", // JoinLeft
    "├", // JoinRight
    "┼", // JoinBoth
  ]

  const parentGraphGlyphs = [
    "│", // Parent
    // "╷", // Ancestor
    "╮", // ForkLeft
    "╭", // ForkRight
    "┬", // ForkBoth
    "┤", // JoinLeft
    "├", // JoinRight
    "┼", // JoinBoth
  ]

  const propagationTerminationGraphGlyphs = [
    " ", // Space
    "╯", // MergeLeft
    "╰", // MergeRight
    "┴", // MergeBoth
  ]

  const horizontalGraphGlyphs = [
    "─", // Horizontal
    "╯", // MergeLeft
    "╰", // MergeRight
    "┴", // MergeBoth
    "╮", // ForkLeft
    "╭", // ForkRight
    "┬", // ForkBoth
    "┤", // JoinLeft
    "├", // JoinRight
    "┼", // JoinBoth
  ]

  const graphTerminationRegex = /[0-9a-f\{\(]/

  function parseJJGraph(jjGraph: string): JJGraphParseOutput {
    const graphNodes: JJGraphNode[] = []
    const rowToGraphNodeMap: Map<JJGraphRow, JJGraphNode> = new Map()
    const activeGraphChildren: Map<JJGraphColumn, Set<JJGraphRow>> = new Map()

    let graphPartMaxLen = 0

    const graphLines = jjGraph.split('\n')
    for (let row = 0; row < graphLines.length; row++) {
      const graphLine = graphLines[row]!
      const splitIndex = graphLine.search(graphTerminationRegex)
      const graphPart = (splitIndex >= 0 ? graphLine.slice(0, splitIndex) : graphLine).padEnd(graphPartMaxLen)
      graphPartMaxLen = Math.max(graphPart.length, graphPartMaxLen)
      const dataPart = splitIndex >= 0 ? graphLine.slice(splitIndex) : ''

      // We need to process the graphRow to figure out which activeGraphChildren are in play for the next row
      type HorizontalBus = number
      let graphNodeColumn = -1
      let graphNodeGlyph = ''
      let horizontalBus = 0
      const columnHorizontalBus: Map<JJGraphColumn, HorizontalBus> = new Map()
      const horizontalBusChildrenToPropagate: Map<HorizontalBus, Set<JJGraphRow>> = new Map()
      for (let column = 0; column < graphPart.length; column++) {
        let currentChar = graphPart[column]!

        // If it isn't a graph glyph, then it's probably a node glyph - like ○, @, ◆ or ~
        if (!graphGlyphs.includes(currentChar)) {
          graphNodeColumn = column
          graphNodeGlyph = currentChar
        }

        columnHorizontalBus.set(column, horizontalBus)

        // If there is no horizontal glyph for this column in this row,
        // increment the horizontal bus counter because the next glyph
        // will not be horizontally linked to this one
        if (!horizontalGraphGlyphs.includes(currentChar)) {
          horizontalBus += 1
        }

        // If there's a "child glyph" for this column in this row,
        // we need to propagate the active children of this column in the previous row
        // to the horizontal bus of this column in this row
        if (childGraphGlyphs.includes(currentChar)) {
          const activeChildrenInColumn = activeGraphChildren.get(column)!
          if (!horizontalBusChildrenToPropagate.has(horizontalBus)) {
            horizontalBusChildrenToPropagate.set(horizontalBus, new Set<JJGraphRow>(activeChildrenInColumn))
          } else {
            const tempSet = horizontalBusChildrenToPropagate.get(horizontalBus)!
            for (const child of activeChildrenInColumn) {
              tempSet.add(child)
            }
          }
        }
      }

      // Find all the parent glyphs and propagation termination glyphs,
      // so we can propagate the necessary active children to the next row
      for (let column = 0; column < graphPart.length; column++) {
        let currentChar = graphPart[column]!

        if (parentGraphGlyphs.includes(currentChar)) {
          const horizontalBus = columnHorizontalBus.get(column)!
          const childrenToPropagate = new Set<JJGraphRow>(horizontalBusChildrenToPropagate.get(horizontalBus))
          const activeChildrenInColumn = activeGraphChildren.get(column)
          if (activeChildrenInColumn) {
            for (const child of activeChildrenInColumn) {
              childrenToPropagate.add(child)
            }
          }
          activeGraphChildren.set(column, childrenToPropagate)
        }

        if (propagationTerminationGraphGlyphs.includes(currentChar)) {
          activeGraphChildren.delete(column)
        }
      }

      // Add this row's node to the graph
      if (graphNodeColumn >= 0) {
        const children = activeGraphChildren.get(graphNodeColumn) ?? new Set<JJGraphRow>()
        for (const child of children) {
          const childNode = rowToGraphNodeMap.get(child)!
          childNode.parents.add(row)
        }

        const graphNode = {
          row: row,
          originalRow: row,
          column: graphNodeColumn,
          originalColumn: graphNodeColumn,
          nodeGlyph: graphNodeGlyph,
          data: dataPart,
          children,
          parents: new Set<JJGraphRow>(),
        }
        graphNodes.push(graphNode)
        rowToGraphNodeMap.set(row, graphNode)
        activeGraphChildren.set(graphNodeColumn, new Set<JJGraphRow>([row]))
      }
    }

    // Normalize rows and columns
    const nodeRows: JJGraphRow[] = []
    const nodeColumns: JJGraphColumn[] = []
    for (const graphNode of graphNodes) {
      nodeRows.push(graphNode.originalRow)
      nodeColumns.push(graphNode.originalColumn)
    }

    nodeRows.sort((a, b) => a - b)
    nodeColumns.sort((a, b) => a - b)

    const rowNormalizationMap: Map<JJGraphRow, JJGraphRow> = new Map(nodeRows.map((x, i) => [x, i]))
    const colNormalizationMap: Map<JJGraphColumn, JJGraphColumn> = new Map(nodeColumns.map((x, i) => [x, i]))

    for (const graphNode of graphNodes) {
      graphNode.row = rowNormalizationMap.get(graphNode.originalRow)!
      graphNode.column = colNormalizationMap.get(graphNode.originalColumn)!
      graphNode.parents = new Set([...graphNode.parents].map(x => rowNormalizationMap.get(x)!))
      graphNode.children = new Set([...graphNode.children].map(x => rowNormalizationMap.get(x)!))
    }

    return {
      nodes: graphNodes,
      originalRowToNodeMap: rowToGraphNodeMap,
    }
  }

  return {
    parseJJGraph
  }
}
