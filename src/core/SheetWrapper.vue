<script setup lang="ts">
import { computed, provide, ref, shallowReactive } from 'vue'
import { TransitionPresets, useThrottleFn, useTransition } from '@vueuse/core'
import { vOnClickOutside } from '@vueuse/components'
import { iosBottomSheet } from '.'

const slots = defineSlots()

const data: any[] = shallowReactive([
  slots.default,
])
provide(iosBottomSheet, data)

const baseWrapperClass = computed(() => {
  if (data.length === 1)
    return 'duration-500 fixed inset-0 rounded-lg bg-neutral-900'
  if (data.length === 2)
    return 'duration-500 fixed inset-0 rounded-lg bg-neutral-900 scale-96 filter brightness-50'
  return ''
})

const length = computed(() => data.length)
const isPush = ref(false)
const currentValue = length
const animateValue = useTransition(currentValue, {
  transition: TransitionPresets.easeOutExpo,
  duration: 500,
  onStarted: () => {
    if (currentValue.value > animateValue.value)
      isPush.value = true
    else
      isPush.value = false
  },
})

const sheetStyle = computed(() => {
  return (idx: number) => {
    if (isPush.value) {
      if (idx === currentValue.value - 1) {
        return {
          transform: `translateY(${(1 + idx - animateValue.value) * 100}vh)`,
        }
      }
      else {
        // start 'translateY(0) scale(1)'
        // end  'translateY(-3vh) scale(0.96)'
        const progress = animateValue.value - idx - 1
        return {
          transform: `translateY(${-3 * progress}vh) scale(${1 - progress * 0.04})`,
          filter: `brightness(${100 - 50 * progress}%)`,
        }
      }
    }
    else {
      if (idx === currentValue.value) {
        const progress = animateValue.value - idx
        return {
          transform: `translateY(${(1 + idx - animateValue.value) * 100}vh)`,
          filter: `brightness(${50 + 50 * progress}%)`,
        }
      }
      else {
        // start 'translateY(-3vh) scale(0.96)'
        // end  'translateY(0) scale(1)'
        const progress = animateValue.value - idx - 1
        return {
          transform: `translateY(${-3 * progress}vh) scale(${1 - progress * 0.04})`,
          filter: `brightness(${100 - 50 * progress}%)`,
        }
      }
    }
  }
})

const onLeave: any = (el: HTMLElement, done: () => void) => {
  // requestAnimationFrame
  const idx = Number(el.dataset.index)
  const cb = () => {
    if (animateValue.value === currentValue.value) {
      done()
      return
    }
    if (idx === currentValue.value) {
      el.style.transform = `translateY(${(1 + idx - animateValue.value) * 100}vh)`
      el.style.filter = `brightness(${100}%)`
    }
    if (idx === currentValue.value - 1) {
      const progress = animateValue.value - idx - 1
      el.style.transform = `translateY(${-3 * progress}vh) scale(${1 - progress * 0.04})`
      el.style.filter = `brightness(${100 - 50 * progress}%)`
    }
    requestAnimationFrame(cb)
  }
  requestAnimationFrame(cb)
}

const closeModal = useThrottleFn((e: PointerEvent, i: number) => {
  if (i === currentValue.value - 2 && !(e.target as Element | null)?.classList.contains('ios-sheet-wrapper'))
    return

  if (data.length > 1)
    data.pop()
}, 500)

const sheets = ref<HTMLElement | null>(null)
</script>

<template>
  <div class="ios-sheet-wrapper">
    <!-- base -->
    <div v-if="data.length <= 2" :class="baseWrapperClass">
      <component :is="data[0]" />
    </div>
    <!-- sheets -->
    <TransitionGroup :css="false" @leave="onLeave">
      <template v-for="(sheet, i) in data" :key="i">
        <div
          v-if="i > 0 && (i === currentValue - 2 || i === currentValue - 1)"
          ref="sheets"
          v-on-click-outside="(el) => closeModal(el, i)"
          :data-index="i"
          :style="sheetStyle(i)"
          class="fixed inset-0 rounded-lg bg-neutral-900 top-[3vh]"
        >
          <component :is="sheet" />
        </div>
      </template>
    </TransitionGroup>
  </div>
</template>
