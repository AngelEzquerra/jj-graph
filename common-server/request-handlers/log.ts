// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api/log'
import { invokeJJ } from '@/jj';
import { createJJCommitGraphParser } from '@common/jj-graph-parser/commit-graph-parser';
import { createJJGraphParserCurved } from '@common/jj-graph-parser/graph-parser';
import type { IntegrationProvider } from '@/integration';

type TObject = string
type TObjectField = string

// Don't use surround() for tObject and tArrayMap, because we want
// the empty object / empty array even if the contents are empty
function tObject(fields: TObjectField[]): TObject {
  return `"{" ++ separate(",",${fields.join(`,`)}) ++ "}"`
}
function tOpt(condExpr: string, ifExpr: string, elseExpr: string = '') {
  if (elseExpr) {
    return `if(${condExpr},${ifExpr},${elseExpr})`
  }
  return `if(${condExpr},${ifExpr})`
}
function tObjectFieldOpt(name: string, expr: string): TObjectField {
  return tOpt(expr, tObjectField(name, expr))
}
function tObjectFieldRaw(name: string, expr: string): TObjectField {
  return `"\\"${name}\\": " ++ ${expr}`
}
function tObjectField(name: string, expr: string): TObjectField {
  return `"\\"${name}\\": " ++ json(${expr})`
}
function tArrayMap(expr: string, eachVar: string, eachExpr: string, ) {
  return `"[" ++ ${expr}.map(|${eachVar}| ${eachExpr}).join(",") ++ "]"`
}
function tEnd(expr: string) {
  return `${expr} ++ "\\n"`
}

const templateStructure = tEnd(tObject([
  tObjectFieldOpt('description', 'self.description()'),
  tObjectFieldOpt('isMine', 'self.mine()'),
  tObjectFieldOpt('isWorkingCopy', 'self.current_working_copy()'),
  tObjectFieldOpt('isHead', 'self.git_head()'),
  tObjectFieldOpt('isDivergent', 'self.divergent()'),
  tObjectFieldOpt('isHidden', 'self.hidden()'),
  tObjectFieldOpt('isImmutable', 'self.immutable()'),
  tObjectFieldOpt('isConflicted', 'self.conflict()'),
  tObjectFieldOpt('isEmpty', 'self.empty()'),
  tObjectField('changeId', 'self.change_id()'),
  tObjectField('changeIdPrefixLen', 'self.change_id().shortest().prefix().len()'),
  tObjectField('commitId', 'self.commit_id()'),
  tObjectField('commitIdPrefixLen', 'self.commit_id().shortest().prefix().len()'),
  tObjectField('author', 'self.author()'),
  tObjectField('committer', 'self.committer()'),
  tObjectFieldRaw('parents', tArrayMap('self.parents()', 'c', 'json(c.commit_id())')),
  tObjectFieldRaw('diffSummaryRaw', tArrayMap('stringify(self.diff().summary()).lines()', 'l', 'json(l)')),
  // tObjectFieldRaw('bookmarks', tArrayMap('self.bookmarks()', 'b', `"\\"" ++ b ++ "\\""`)),
  tObjectFieldRaw('bookmarksLocal', tArrayMap('self.local_bookmarks()', 'lb', `json(lb)`)),
  tObjectFieldRaw('bookmarksRemote', tArrayMap('self.remote_bookmarks()', 'rb', `json(rb)`)),
  tObjectFieldRaw('tags', tArrayMap('self.tags()', 't', `json(t)`)),
]))

function argsForJJCommitLog(revset?: string) {
  const jjCommitLogArgs = [
    `log`,
    `-T`, templateStructure,
    `--no-pager`,
    `--ignore-working-copy`,
  ]
  if (revset) {
    jjCommitLogArgs.push(
      `-r`, revset,
    )
  }
  return jjCommitLogArgs
}

const graphParserCurved = createJJGraphParserCurved()
const commitGraphParser = createJJCommitGraphParser()

export async function handleRequest(request: api.RequestParameters, ip: IntegrationProvider): Promise<api.Response> {
  const [cpStdio, cpStderr] = await invokeJJ(request.repoDir, argsForJJCommitLog(request.revset))
  // console.log(cpStdio)
  const graphParsed = graphParserCurved.parseJJGraph(cpStdio)
  // console.log(graphParsed.nodes)
  const commitGraphParsed = commitGraphParser.parseJJCommitGraph(graphParsed)
  return commitGraphParsed
}
