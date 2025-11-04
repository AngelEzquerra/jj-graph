// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

const Modified = Symbol()
const Added = Symbol()
const Deleted = Symbol()
const Copied = Symbol()
const Renamed = Symbol()

const diffStatuses = {
  full: {
    [Modified]: 'modified',
    [Added]: 'added',
    [Deleted]: 'removed',
    [Copied]: 'copied',
    [Renamed]: 'renamed',
  },
  short: {
    [Modified]: 'M',
    [Added]: 'A',
    [Deleted]: 'D',
    [Copied]: 'C',
    [Renamed]: 'R',
  },
} as const

type InvertRecord<T extends Record<keyof T, PropertyKey>> = { readonly [P in keyof T as T[P]]: P }

type JJDiffStatus = typeof diffStatuses
export type JJDiffStatusFull = keyof InvertRecord<JJDiffStatus['full']>
export type JJDiffStatusShort = keyof InvertRecord<JJDiffStatus['short']>


const fullDiffStatusMap = Object.fromEntries(Object.getOwnPropertySymbols(diffStatuses.full).map((k) => [(diffStatuses.full as any)[k], k])) as InvertRecord<JJDiffStatus['full']>
const shortDiffStatusMap = Object.fromEntries(Object.getOwnPropertySymbols(diffStatuses.short).map((k) => [(diffStatuses.short as any)[k], k]))  as InvertRecord<JJDiffStatus['short']>

export const DiffStatus = {
  Modified,
  Added,
  Deleted,
  Copied,
  Renamed,
}

export function parseFullDiffStatus(status: JJDiffStatusFull): symbol {
  return fullDiffStatusMap[status]
}

export function parseShortDiffStatus(status: JJDiffStatusShort): symbol {
  return shortDiffStatusMap[status]
}

export function getFullDiffStatus(symbol: symbol): JJDiffStatusFull | undefined {
  return (diffStatuses.full as any)[symbol]
}

export function getShortDiffStatus(symbol: symbol): JJDiffStatusShort | undefined {
  return (diffStatuses.short as any)[symbol]
}

export type JJDiffSummaryRaw = string[]

export type JJDiffSummaryFileEntry = {
  conflict?: boolean
  path: string
}

export type JJDiffSummaryFile = {
  status: JJDiffStatusFull
  source: JJDiffSummaryFileEntry
  target: JJDiffSummaryFileEntry
}
