<script setup lang="ts">
import '@unocss/reset/tailwind.css'
import { SheetWrapper, pushSheet } from '../../dist'
import Sheet1 from './Sheet1.vue'
</script>

<template>
  <SheetWrapper>
    <div class="p-4 text-center @light:bg-white min-h-[100vh]">
      <div class="mb-2 text-4xl font-bold">
        Vue iOS Sheet
      </div>
      <div>
        <button
          class="p-2 my-16 bg-amber text-black rounded-lg" @click="() => {
            pushSheet(Sheet1)
          }"
        >
          Push Sheet
        </button>
      </div>
    </div>
  </SheetWrapper>
</template>
