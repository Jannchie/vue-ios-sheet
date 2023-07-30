# Vue iOS Sheet

<p align="center" style="overflow: hidden; border-radius:">
  <img src="public/example.gif">
</p>

## Install

```bash
pnpm install vue-ios-sheet
```

## Usage

```vue
<script setup>
import { SheetWrapper, pushSheet } from 'vue-ios-sheet'
import Sheet from './Sheet.vue'
</script>

<template>
  <SheetWrapper>
    <button
      @click="() => {
        pushSheet(Sheet) // any component
      }"
    >
      Push Sheet
    </button>
  </SheetWrapper>
</template>
```

## Development

```bash
pnpm install -r
pnpm build
pnpm run dev
```
