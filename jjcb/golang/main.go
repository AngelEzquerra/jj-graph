// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

package main

import (
  "os"
  "errors"
  "io/fs"
  "time"
  "fmt"
)

func main() {
  exitCode := 0
  defer func() {
    os.Exit(exitCode)
  }()

  args := os.Args
  if len(args) < 2 {
    exitCode = 1
    return
  }
  terminationPath := args[1]
  cwd, err := os.Getwd()
  if err != nil {
    exitCode = 1
    return
  }
  fmt.Println(cwd)

  for {
    _, err := os.Stat(terminationPath)
    if errors.Is(err, fs.ErrNotExist) {
      break
    }

    time.Sleep(50 * time.Millisecond)
  }
}
