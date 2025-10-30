// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { ChildProcess, spawn } from 'child_process'

export function spawnJJ(repoPath: string, cmdArgs: string[]): ChildProcess {
  console.log('invoking jj with args', cmdArgs.join(" "))
  return spawn('jj', cmdArgs, { cwd: repoPath })
}

export async function handleCp(cp: ChildProcess) {
  return new Promise<[string, string]>((resolve, reject) => {
    const output: Buffer[] = [];
    const errOutput: Buffer[] = [];
    cp.stdout!.on("data", (data: Buffer) => {
      console.log('receivedData');
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

export async function invokeJJ(repoPath: string, cmdArgs: string[]) {
  return await handleCp(spawnJJ(repoPath, cmdArgs))
}
