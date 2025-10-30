// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { ChildProcess, spawn } from 'child_process'
import { withTempDir } from './tmpFileUtils'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export type SpawnHandleOptions = {
  resolveOnFirstNewline?: boolean
}

export function spawnJJ(repoPath: string, cmdArgs: string[]): ChildProcess {
  console.log('invoking jj with args', cmdArgs.join(" "))
  return spawn('jj', cmdArgs, { cwd: repoPath })
}

const charCode_LF = "\n".charCodeAt(0)
const charCode_CR = "\r".charCodeAt(0)
export async function handleCp(cp: ChildProcess, opts?: SpawnHandleOptions) {
  const { resolveOnFirstNewline } = opts ?? {}
  return new Promise<[string, string]>((resolve, reject) => {
    const output: Buffer[] = [];
    const errOutput: Buffer[] = [];
    cp.stdout!.on("data", (data: Buffer) => {
      console.log('receivedData');
      output.push(data);
      const finalByte = data[data.length - 1]
      if (resolveOnFirstNewline && (finalByte === charCode_LF || finalByte === charCode_CR)) {
        resolve([Buffer.concat(output).toString(), Buffer.concat(errOutput).toString()])
      }
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

export async function invokeJJ(repoPath: string, cmdArgs: string[]) {
  return await handleCp(spawnJJ(repoPath, cmdArgs))
}

export async function invokeJJDiff(repoPath: string, commitId: string, toolPath: string, terminationPath: string) {
  const [stdio, stderr] = await handleCp(spawnJJ(repoPath, [
    "diff",
    `-r`,
    `commit_id(${commitId})`,
    `--tool=jjcb`,
    `--no-pager`,
    `--config`,
    `merge-tools.jjcb.program="${toolPath}"`,
    `--config`,
    `merge-tools.jjcb.diff-args=["${terminationPath}", "$left", "$right"]`,
  ]), { resolveOnFirstNewline: true })
  return stdio.trim()
}

export class JJCbDiff {
  constructor(readonly jjCbPath: string) { }

  getContent(repoPath: string, commitId: string, side: 'left' | 'right', filePath: string) {
    return new Promise<string>(async (resolve, reject) => {
      withTempDir(async dir => {
        const diffDir = await invokeJJDiff(repoPath, commitId, this.jjCbPath, dir)
        const diffFilePath = join(diffDir, side, filePath)
        const fileExists = existsSync(diffFilePath)
        if (fileExists) {
          const fileContent = readFileSync(diffFilePath, { encoding: 'utf-8' })
          resolve(fileContent)
        } else {
          resolve('')
        }
      })
    })
  }

  getLeft(repoPath: string, commitId: string, filePath: string) {
    return this.getContent(repoPath, commitId, 'left', filePath)
  }

  getRight(repoPath: string, commitId: string, filePath: string) {
    return this.getContent(repoPath, commitId, 'left', filePath)
  }
}
