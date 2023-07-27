<script setup lang="ts">
import { inject } from 'vue'
import { iosBottomSheet } from './core'
import Sheet2 from './Sheet2.vue'

const data = inject<any>(iosBottomSheet, [])
</script>

<template>
  <div class="p-4">
    <div class="mb-2">
      Sheet 1
    </div>
    <div>
      <button
        class="p-2" @click="() => {
          data.push(Sheet2)
        }"
      >
        Push sheet 2
      </button>
    </div>
  </div>
</template>
