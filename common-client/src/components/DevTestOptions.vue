<!--
SPDX-FileCopyrightText: 2025 Velociraptor115

SPDX-License-Identifier: LGPL-3.0-only
-->

<script lang="ts" setup>
import { useDevTestOptionsStore } from '@common-client/stores/devTestOptions'
import { useRepoSourceStore } from '@common-client/stores/repoSource'
import { storeToRefs } from 'pinia'

const devTestOptionsStore = useDevTestOptionsStore()
const repoSourceStore = useRepoSourceStore()

const {
  parentLineCreationOption, nodeCreationOption, lazyBranchingOption, eagerMergingOption,
  useLogNodeMarkersOption, logNodeMarkerSizeOption,
} = storeToRefs(devTestOptionsStore)
const { graphSource, knownGraphSources } = storeToRefs(repoSourceStore)

</script>

<template>
  <form>
    <div class="form-row">
      <label>Source</label>
      <select name="graphSource" v-model="graphSource">
        <optgroup label="Repo">
          <option v-for="knownGraphSource in knownGraphSources.repo" :value="({ type: 'repo', value: knownGraphSource.value })">{{ knownGraphSource.label }}</option>
        </optgroup>
        <optgroup label="Inline">
          <option v-for="knownGraphSource in knownGraphSources.inline" :value="({ type: 'inline', value: knownGraphSource.value })">{{ knownGraphSource.label }}</option>
        </optgroup>
      </select>
    </div>
    <div class="form-row">
      <label>Parent Line Creation</label>
      <input type="radio" name="parentLineCreation" value="new" v-model="parentLineCreationOption">New</input>
      <input type="radio" name="parentLineCreation" value="existing" v-model="parentLineCreationOption">Existing</input>
      <input type="radio" name="parentLineCreation" value="leftmost" v-model="parentLineCreationOption">Left-most</input>
    </div>
    <div class="form-row">
      <label>Node Creation</label>
      <input type="radio" name="nodeCreation" value="new" v-model="nodeCreationOption" disabled>New</input>
      <input type="radio" name="nodeCreation" value="existing" v-model="nodeCreationOption">Existing</input>
      <input type="radio" name="nodeCreation" value="leftmost" v-model="nodeCreationOption">Left-most</input>
    </div>
    <div class="form-row">
      <label>Lazy Branching</label>
      <input type="checkbox" name="lazyBranching" v-model="lazyBranchingOption"></input>
    </div>
    <div class="form-row">
      <label>Eager Merging</label>
      <input type="checkbox" name="eagerMerging" v-model="eagerMergingOption"></input>
    </div>
    <div class="form-row">
      <label>Log Node Markers</label>
      <input type="checkbox" name="logNodeMarkers" v-model="useLogNodeMarkersOption"></input>
      <label>Size</label>
      <input type="number" name="logNodeMarkerSize" v-model="logNodeMarkerSizeOption"></input>
    </div>
  </form>
</template>

<style scoped>
.form-row {
  display: flex;
  gap: 4px;
}
</style>
