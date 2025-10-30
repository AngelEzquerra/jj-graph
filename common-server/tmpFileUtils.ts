// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { realpath, mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join, sep } from 'path';

export type PathCallback<T> = (path: string) => T

export function withTempFile<T>(cb: PathCallback<T>): Promise<T> {
  return withTempDir(dir => cb(join(dir, "file")));
}

export async function withTempDir<T>(cb: PathCallback<T>): Promise<T> {
  const dir = await mkdtemp(await realpath(tmpdir()) + sep);
	try {
		return await cb(dir);
	} finally {
		rm(dir, {recursive: true});
	}
}
