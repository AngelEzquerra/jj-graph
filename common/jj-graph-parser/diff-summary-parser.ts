// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { type JJDiffStatusShort, type JJDiffSummaryRaw, type JJDiffSummaryFile, parseShortDiffStatus, getFullDiffStatus, type JJDiffSummaryFileEntry, parseFullDiffStatus, getShortDiffStatus } from "../models/diff"

export type DiffSummaryItem = {
  status: JJDiffStatusShort
  pathItems: string[]
  source: JJDiffSummaryFileEntry
  target: JJDiffSummaryFileEntry
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

const pathSep = '/'

function processPathParts(left: string, right: string, pathSep: string): [ prefix: string, suffix: string, leftOnly: string, rightOnly: string ]
{
  if (left === right) {
    return [ left, '', '', '' ]
  }
  const leftPathItems = left.split(pathSep).filter(x => x)
  const rightPathItems = right.split(pathSep).filter(x => x)
  function p(a: string[], b: string[])
  {
    let prefixPoint = 0
    let suffixPoint = 0
    for (prefixPoint = 0; prefixPoint < a.length; prefixPoint++)
    {
      if (a[prefixPoint] != b[prefixPoint]) {
        break
      }
    }
    for (suffixPoint = 0; suffixPoint < (a.length - prefixPoint); suffixPoint++)
    {
      if (a[a.length - 1 - suffixPoint] != b[b.length - 1 - suffixPoint]) {
        break
      }
    }
    const commonPrefix = a.slice(0, prefixPoint!)
    const commonSuffix = a.slice(a.length - suffixPoint!)
    const aOnly = a.slice(prefixPoint!, a.length - suffixPoint!)
    const bOnly = b.slice(prefixPoint!, b.length - suffixPoint!)
    return [commonPrefix, commonSuffix, aOnly, bOnly] as const
  }
  const [ a, b ] = leftPathItems.length > rightPathItems.length ? [ rightPathItems, leftPathItems ] : [ leftPathItems, rightPathItems ]
  const [ prefixArr, suffixArr, aOnly, bOnly ] = p(a, b)
  const [ leftOnlyArr, rightOnlyArr ] = leftPathItems.length > rightPathItems.length ? [ bOnly, aOnly ] : [ aOnly, bOnly ]
  const [ prefix, suffix, leftOnly, rightOnly ] = [ prefixArr.join(pathSep), suffixArr.join(pathSep), leftOnlyArr.join(pathSep), rightOnlyArr.join(pathSep) ]
  return [ prefix, suffix, leftOnly, rightOnly ]
}

function pathItemsNormalized(pathPart: string): string[] {
  return pathPart.split(pathSep).filter(x => x)
}

function splitPathIntoPathItems(path: string): [ leftPath: string, rightPath: string, pathItems: string[] ] {
  const pathChangeMatch = path.match(/(.*)\{(.*) \=\> (.*)\}(.*)/)!
  if (pathChangeMatch != null) {
    const [ fullMatch, commonPrefix, leftOnly, rightOnly, commonSuffix ] = pathChangeMatch
    const leftPath = `${commonPrefix}${leftOnly}${commonSuffix}`
    const rightPath = `${commonPrefix}${rightOnly}${commonSuffix}`
    return [
      leftPath, rightPath,
      [
        ...pathItemsNormalized(commonPrefix ?? ''),
        `${leftOnly} => ${rightOnly}}`,
        ...pathItemsNormalized(commonSuffix ?? ''),
      ]
    ]
  } else {
    return [ path, path, pathItemsNormalized(path) ]
  }
}

export function parseDiffSummaryRaw(raw: JJDiffSummaryRaw): DiffSummaryItem[] {
  return raw.filter(x => x.length > 2).map(x => {
    const shortStatus = x[0] as JJDiffStatusShort
    const path = x.slice(2)
    const [ leftPath, rightPath, pathItems ] = splitPathIntoPathItems(path)
    return {
      status: shortStatus,
      pathItems,
      source: {
        path: leftPath
      },
      target: {
        path: rightPath
      }
    }
  })
}

export function parseDiffSummaryFiles(files: JJDiffSummaryFile[]): DiffSummaryItem[] {
  return files.map(({ status, source, target }) => {
    const shortStatus = getShortDiffStatus(parseFullDiffStatus(status))!
    const leftPath = source.path
    const rightPath = target.path
    if (leftPath === rightPath) {
      return {
        status: shortStatus,
        pathItems: pathItemsNormalized(leftPath),
        source,
        target,
      }
    }
    const [ commonPrefix, commonSuffix, leftOnly, rightOnly ] = processPathParts(leftPath, rightPath, pathSep)
    return {
      status: shortStatus,
      pathItems: [ ...pathItemsNormalized(commonPrefix), `${leftOnly} => ${rightOnly}`, ...pathItemsNormalized(commonSuffix) ],
      source,
      target,
    }
  })
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
      tree.path = tree.path ? `${tree.path}${pathSep}${singleChild.path}`: singleChild.path
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

function sortTree(tree: DiffSummaryTreeItemTree) {
  const treeChildren = tree.children.filter(x => x.type === 'tree')
  const leafChildren = tree.children.filter(x => x.type === 'leaf')

  treeChildren.forEach(x => sortTree(x))

  tree.children = [ ...treeChildren, ...leafChildren ]

  return tree
}

export function parseDiffTree(summary: DiffSummaryItem[]): DiffSummaryTree {
  const root: DiffSummaryTree = { type: 'tree', path: '', children: [] }
  for (const summaryItem of summary) {
    insertSummaryItem(root, summaryItem.pathItems, summaryItem)
  }

  return sortTree(simplifyTree(root))
}
