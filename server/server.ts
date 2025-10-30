// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import express from 'express';
import cors from 'cors';
import { handleRequest } from '@common-server';
import { type IntegrationProvider } from '@common-server/integration';

const app = express();
app.use(cors())
app.use(express.json())
const port = 3000;

const ip: IntegrationProvider = {
  listRepos() {
    return [
      process.env.JJ_REPO_PATH!,
    ]
  },
  viewDiff(repoPath: string, commitId: string, filePath: string): void {
    console.log('viewDiff', { repoPath, commitId, filePath })
  }
}

app.post('/', async (req, res) => {
  const body = req.body
  console.log('Received Body', body)
  const response = await handleRequest(body, ip)
  console.log(response)
  res.json(response)
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
