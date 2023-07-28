<script setup lang="ts">
import { pushSheet } from '../../dist'
import Sheet2 from './Sheet2.vue'
</script>

<template>
  <div class="p-4">
    <div class="pb-4 text-4xl font-bold">
      Sheet 1
    </div>
    <div>
      <button
        class="p-2 bg-amber text-black rounded-lg" @click="() => {
          pushSheet(Sheet2)
        }"
      >
        Push sheet 2
      </button>
    </div>
  </div>
</template>
