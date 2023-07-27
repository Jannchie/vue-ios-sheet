<script setup lang="ts">
import { inject } from 'vue'
import { iosBottomSheet } from './core'
import Sheet1 from './Sheet1.vue'

const data = inject<any>(iosBottomSheet, [])
</script>

<template>
  <div class="p-4">
    <div class="mb-2">
      Sheet 2
    </div>
    <div>
      <button
        class="p-2" @click="() => {
          data.push(Sheet1)
        }"
      >
        Push sheet 1
      </button>
    </div>
  </div>
</template>
