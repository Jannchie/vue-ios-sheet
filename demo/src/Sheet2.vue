<script setup lang="ts">
import { pushSheet } from '../../dist'
import Sheet1 from './Sheet1.vue'
</script>

<template>
  <div class="p-4 min-h-[200vh]">
    <div class="pb-4 text-4xl font-bold">
      Sheet 2
    </div>
    <div>
      <button
        class="p-2 bg-amber text-black rounded-lg" @click="() => {
          pushSheet(Sheet1)
        }"
      >
        Push sheet 1
      </button>
      <div class="mt-2">
        It can be scrolled.
      </div>
    </div>
  </div>
</template>
