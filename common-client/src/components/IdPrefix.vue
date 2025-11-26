<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">

import { useToast } from '@nuxt/ui/runtime/composables/useToast.js';
import { useClipboard } from '@vueuse/core';
import { computed } from 'vue';

type ThisComponentProps = {
  id: string
  prefix: number
  prefixMin?: number
}

const { id, prefix, prefixMin } = defineProps<ThisComponentProps>()
const idPrefix = computed(() => id.slice(0, prefix))
const idSuffix = computed(() => id.slice(prefix, prefixMin))
const { copy, copied } = useClipboard()
const toast = useToast()

function copyPrefix() {
  copy(idPrefix.value)
  toast.add({ icon: 'i-lucide-clipboard-copy', title: `Copied id prefix`, description: idPrefix.value })
}

function copyId() {
  copy(id)
  toast.add({ icon: 'i-lucide-clipboard-copy', title: `Copied id`, description: id })
}
</script>

<template>
  <pre><span class="id-sp cursor-pointer" @click="copyPrefix">{{ idPrefix }}</span><span class="id-rest cursor-pointer" @click="copyId">{{ idSuffix }}</span></pre>
</template>

<style scoped>
/* Shortest Prefix */
.id-sp {
  font-weight: bold;
}

.id-rest {
  color: var(--ui-text-muted)
}
</style>
