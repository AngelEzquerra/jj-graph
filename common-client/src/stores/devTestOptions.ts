// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { type NodeColumnGenOptions } from '@common/jj-graph-renderer/layout'

export const useDevTestOptionsStore = defineStore('devTestOptions', () => {
  const parentLineCreationOption = ref<string>('leftmost')
  const nodeCreationOption = ref<string>('existing')
  const lazyBranchingOption = ref<boolean>(false)
  const eagerMergingOption = ref<boolean>(false)
  const useLogNodeMarkersOption = ref<boolean>(false)
  const logNodeMarkerSizeOption = ref<number>(16)

  const opts = computed<NodeColumnGenOptions>(() => ({
    parentLineCreation: parentLineCreationOption.value as any,
    nodeCreation: nodeCreationOption.value as any,
    preferLazyBranchingParentLines: lazyBranchingOption.value,
    preferMergingParentLines: eagerMergingOption.value,
  }))

  return {
    parentLineCreationOption, nodeCreationOption, lazyBranchingOption, eagerMergingOption, opts,
    useLogNodeMarkersOption, logNodeMarkerSizeOption
  }
})
