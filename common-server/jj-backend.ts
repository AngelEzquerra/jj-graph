// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { ChildProcess, spawn } from 'child_process'
import * as api from '@common/api'
import { createJJCommitGraphParser } from '@common/jj-graph-parser/commit-graph-parser';
import { createJJGraphParserCurved } from '@common/jj-graph-parser/graph-parser';

function invokeJJ(repoPath: string, cmdArgs: string[]): ChildProcess {
  console.log('invoking jj with args', cmdArgs.join(" "))
  return spawn('jj', cmdArgs, { cwd: repoPath })
}

async function handleCp(cp: ChildProcess) {
  return new Promise<[string, string]>((resolve, reject) => {
    const output: Buffer[] = [];
    const errOutput: Buffer[] = [];
    cp.stdout!.on("data", (data: Buffer) => {
      output.push(data);
    });
    cp.stderr!.on("data", (data: Buffer) => {
      errOutput.push(data);
    });
    cp.on("error", (error: Error) => {
      reject(new Error(`Spawning command failed: ${error.message}`));
    });
    cp.on("close", (code, signal) => {
      if (code) {
        reject(
          new Error(
            `Command failed with exit code ${code}.\nstdout: ${Buffer.concat(output).toString()}\nstderr: ${Buffer.concat(errOutput).toString()}`,
          ),
        );
      } else if (signal) {
        reject(
          new Error(
            `Command failed with signal ${signal}.\nstdout: ${Buffer.concat(output).toString()}\nstderr: ${Buffer.concat(errOutput).toString()}`,
          ),
        );
      } else {
        resolve([Buffer.concat(output).toString(), Buffer.concat(errOutput).toString()]);
      }
    });
  });
}


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

function argsForJJCommitLog(logAll: boolean) {
  const jjCommitLogArgs = [
    `log`,
    `-T`, templateStructure,
    `--no-pager`,
  ]
  if (logAll) {
    jjCommitLogArgs.push(
      `-r`, `all()`,
    )
  }
  return jjCommitLogArgs
}

const graphParserCurved = createJJGraphParserCurved()
const commitGraphParser = createJJCommitGraphParser()

async function handleJJCommitLogInvocation() {
  const [cpStdio, cpStderr] = await handleCp(invokeJJ(process.env.JJ_REPO_PATH!, argsForJJCommitLog(true)))
  // console.log(cpStdio)
  const graphParsed = graphParserCurved.parseJJGraph(cpStdio)
  // console.log(graphParsed.nodes)
  const commitGraphParsed = commitGraphParser.parseJJCommitGraph(graphParsed)
  return commitGraphParsed
}

export async function handleRequest(request: api.JJApiRequest): Promise<api.JJApiResponse> {
  switch (request.request) {
    case api.REQUEST_LOG:
      const logOutput = await handleJJCommitLogInvocation()
      return { ...request, response: { commits: logOutput.nodes } }
    default:
      return { ...request, response: 'Unknown request' }
  }
}
