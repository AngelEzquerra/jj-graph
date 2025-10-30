// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

using System.IO;

var terminationPath = args[0];

Console.WriteLine(Directory.GetCurrentDirectory());

while (Directory.Exists(terminationPath))
{
  Thread.Sleep(50);
}
