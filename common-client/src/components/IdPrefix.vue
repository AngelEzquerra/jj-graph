<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script setup lang="ts">

type ThisComponentProps = {
  id: string
  prefix: number
  prefixMin?: number
}

const { id, prefix, prefixMin } = defineProps<ThisComponentProps>()
</script>

<template>
  <pre><span class="id-sp">{{ id.slice(0, prefix) }}</span><span class="id-rest">{{ id.slice(prefix, prefixMin) }}</span></pre>
</template>

<style scoped>
/* Shortest Prefix */
.id-sp {
  font-weight: bold;
}

.id-rest {
  color: rgb(from currentColor r g b / calc(alpha * 0.6))
}
</style>
