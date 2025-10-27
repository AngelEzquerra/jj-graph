// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

type DiffSummaryRaw = string[]

export const Modified = 'M'
export const Added = 'A'
export const Deleted = 'D'
export const Renamed = 'R'
export const Copied = 'C'

export type Status =
  | typeof Modified
  | typeof Added
  | typeof Deleted
  | typeof Renamed
  | typeof Copied

export type DiffSummaryItem = {
  status: Status
  path: string
}

type DiffSummaryTreeItemTree = {
  type: 'tree'
  path: string
  children: DiffSummaryTree[]
}

type DiffSummaryTreeItemLeaf = {
  type: 'leaf'
  path: string
  item: DiffSummaryItem
}

export type DiffSummaryTree =
  | DiffSummaryTreeItemTree
  | DiffSummaryTreeItemLeaf


export function parseDiffSummary(raw: DiffSummaryRaw): DiffSummaryItem[] {
  return raw.filter(x => x.length > 2).map(x => ({
    status: x[0] as Status,
    path: x.slice(2)
  }))
}

function insertSummaryItem(tree: DiffSummaryTreeItemTree, path: string[], item: DiffSummaryItem) {
  if (path.length <= 0) {
    return
  }

  if (path.length === 1) {
    const pathItem = path[0]!
    const existingNode = tree.children.find(x => x.path === pathItem)
    if (existingNode) {
      throw new Error("Duplicate tree item")
    } else {
      tree.children.push({ type: 'leaf', item, path: pathItem })
    }
  } else {
    const pathItem = path[0]!
    const existingTree = tree.children.find(x => x.path === pathItem)
    if (existingTree && existingTree.type === 'tree') {
      if (existingTree.type === 'tree') {
        insertSummaryItem(existingTree, path.slice(1), item)
      } else {
        throw new Error("Expected tree item, but found non-tree")
      }
    } else {
      const newTree: DiffSummaryTree = { type: 'tree', path: pathItem, children: [] }
      tree.children.push(newTree)
      insertSummaryItem(newTree, path.slice(1), item)
    }
  }
}

function simplifyTree(tree: DiffSummaryTreeItemTree) {
  if (tree.children.length === 1) {
    const singleChild = tree.children[0]!
    if (singleChild.type === 'tree') {
      tree.path = tree.path ? `${tree.path}/${singleChild.path}`: singleChild.path
      tree.children = singleChild.children
      simplifyTree(tree)
    }
  } else {
    for (const child of tree.children) {
      if (child.type === 'tree') {
        simplifyTree(child)
      }
    }
  }
  return tree
}

const pathDelimiterRegex = /[\/\\]/
export function parseDiffTree(summary: DiffSummaryItem[]): DiffSummaryTree {
  const summaryWithSplitPaths = summary.map(x => ({ ...x, pathItems: x.path.split(pathDelimiterRegex) }))

  const root: DiffSummaryTree = { type: 'tree', path: '', children: [] }

  for (const summaryItem of summaryWithSplitPaths) {
    insertSummaryItem(root, summaryItem.pathItems, summaryItem)
  }

  return simplifyTree(root)
}
