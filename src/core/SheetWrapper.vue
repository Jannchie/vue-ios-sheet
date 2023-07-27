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
const manualValue = ref(0)
const currentValue = length
const temp = computed(() => manualValue.value ? manualValue.value : currentValue.value)
const animateValue = useTransition(temp, {
  transition: TransitionPresets.easeOutExpo,
  duration: 500,
  onStarted: () => {
    if (currentValue.value > animateValue.value)
      isPush.value = true
    else
      isPush.value = false
  },
})
const trueValue = computed(() => {
  return manualValue.value ? manualValue.value : animateValue.value
})

const sheetStyle = computed(() => {
  return (idx: number) => {
    if (isPush.value) {
      if (idx === currentValue.value - 1) {
        return {
          transform: `translateY(${(1 + idx - trueValue.value) * 100}vh)`,
        }
      }
      else {
        // start 'translateY(0) scale(1)'
        // end  'translateY(-3vh) scale(0.96)'
        const progress = trueValue.value - idx - 1
        return {
          transform: `translateY(${-3 * progress}vh) scale(${1 - progress * 0.04})`,
          filter: `brightness(${100 - 50 * progress}%)`,
        }
      }
    }
    else { // pop
      if (idx === currentValue.value) {
        // start 'translateY(0) filter brightness(100%)'
        // end  'translateY(-3vh) filter brightness(50%)'
        const progress = trueValue.value - idx
        return {
          transform: `translateY(${(1 + idx - trueValue.value) * 100}vh)`,
          filter: `brightness(${50 + 50 * progress}%)`,
        }
      }
      else {
        // start 'translateY(-3vh) scale(0.96)'
        // end  'translateY(0) scale(1)'
        const progress = trueValue.value - idx - 1
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
  const currentTranslateY = el.style.transform.match(/translateY\((.*)vh\)/)?.[1]
  console.log(currentTranslateY)
  const cb = () => {
    if (trueValue.value === currentValue.value) {
      done()
      return
    }
    if (idx === currentValue.value) {
      el.style.transform = `translateY(calc(${(1 + idx - trueValue.value) * 100}vh + ${currentTranslateY}vh))`
      el.style.filter = `brightness(${100}%)`
    }
    if (idx === currentValue.value - 1) {
      const progress = trueValue.value - idx - 1
      el.style.transform = `translateY(${-3 * progress}vh) scale(${1 - progress * 0.04})`
      el.style.filter = `brightness(${100 - 50 * progress}%)`
    }
    requestAnimationFrame(cb)
  }
  requestAnimationFrame(cb)
}

const throttlePop = useThrottleFn(() => {
  if (data.length > 1)
    data.pop()
}, 500)

const closeSheet = useThrottleFn((e: PointerEvent, i: number) => {
  if (i === currentValue.value - 2 && !(e.target as Element | null)?.classList.contains('ios-sheet-wrapper'))
    return
  throttlePop()
}, 500)

const dragStartPos = ref({ x: 0, y: 0 })
const progress = ref(0)
const isDragging = ref(false)
function onDragStart(e: PointerEvent) {
  e.preventDefault()
  isDragging.value = true
  dragStartPos.value = { x: e.clientX, y: e.clientY }
}

let lastEventTime = window.performance.now()
let lastEventY = 0
let speedY = 0
let timerId: number | null = null
function onDrag(e: PointerEvent) {
  e.preventDefault()
  if (!isDragging.value)
    return
  const currentEventTime = window.performance.now()
  const timeDifference = currentEventTime - lastEventTime
  const dy = e.clientY - lastEventY
  speedY = dy / timeDifference // 垂直速度，单位是像素/毫秒
  // 更新上一个事件的时间和位置
  lastEventTime = currentEventTime
  lastEventY = e.clientY
  const diff = e.clientY - dragStartPos.value.y
  const height = window.innerHeight
  progress.value = diff / height
  // 清除上一个定时器
  if (timerId !== null)
    clearTimeout(timerId)

  // 设置新的定时器
  timerId = setTimeout(() => {
    speedY = 0
  }, 100) // 在100毫秒后如果没有新的pointermove事件，就将速度归零
  if (progress.value < 0)
    return
  manualValue.value = -progress.value + currentValue.value
}
function onDragEnd(e: PointerEvent) {
  e.preventDefault()
  isDragging.value = false
  if (speedY > 1)
    throttlePop()
  manualValue.value = 0
}
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
          v-on-click-outside="(el) => closeSheet(el, i)" :data-index="i" :style="sheetStyle(i)"
          class="fixed inset-0 rounded-lg bg-neutral-900 top-[3vh]" @pointerdown="onDragStart" @pointermove="onDrag"
          @pointerup="onDragEnd"
        >
          <component :is="sheet" />
        </div>
      </template>
    </TransitionGroup>
  </div>
</template>
