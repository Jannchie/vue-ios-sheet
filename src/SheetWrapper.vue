<script setup lang="ts">
import { computed, onMounted, provide, ref, shallowReactive, watchEffect } from 'vue'
import { TransitionPresets, usePreferredColorScheme, useThrottleFn, useTransition } from '@vueuse/core'
import { vOnClickOutside } from '@vueuse/components'
import { interpolateRgb } from 'd3-interpolate'
import { iosBottomSheet, iosBottomSheetEventBus } from '.'

const { scale = 4, space = 1, rounded = 0.5, sheetClass = '', sheetBgColor, duration = 500 } = defineProps<{
  scale?: number
  space?: number
  rounded?: number
  sheetClass?: string
  sheetBgColor?: string
  duration?: number
}>()

const slots = defineSlots()
const isDragging = ref(false)
const durationForTransiton = computed(() => {
  if (isDragging.value)
    return 0
  return duration
})
const theme = usePreferredColorScheme()

const finalSheetBgColor = sheetBgColor ?? (theme.value === 'dark' ? '#111' : '#fff')

const data: any[] = shallowReactive([
  slots.default,
])
provide(iosBottomSheet, data)

const length = computed(() => data.length)
const isPush = ref(false)
const manualValue = ref(0)
const currentValue = length
const temp = computed(() => manualValue.value ? manualValue.value : currentValue.value)
const animateValue = useTransition(temp, {
  transition: TransitionPresets.easeOutExpo,
  duration: durationForTransiton,
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
        const progress = trueValue.value - idx
        return {
          transform: `translateY(calc(${(1 + idx - trueValue.value) * 100}vh + ${space * 2 * progress}rem))`,
          borderRadius: `${rounded}rem`,
          backgroundColor: finalSheetBgColor,
        }
      }
      else {
        // start 'translateY(0) scale(1)'
        // end  'translateY(-3vh) scale(0.96)'
        const progress = trueValue.value - idx - 1
        return {
          transform: `scale(${1 - progress * scale / 100}) translateY(${((1 - progress) * space + space)}rem)`,
          filter: `brightness(${100 - 10 * progress}%)`,
          borderRadius: `${rounded}rem`,
          backgroundColor: finalSheetBgColor,
        }
      }
    }
    else { // pop
      const progress = trueValue.value - idx - 1
      return {
        transform: `translateY(${space + space * (1 - progress)}rem) scale(${1 - progress * scale / 100})`,
        filter: `brightness(${100 - 10 * progress}%)`,
        borderRadius: `${rounded}rem`,
        backgroundColor: finalSheetBgColor,
      }
    }
  }
})

const onLeave: any = (el: HTMLElement, done: () => void) => {
  // requestAnimationFrame
  const idx = Number(el.dataset.index)
  const cb = () => {
    if (trueValue.value === currentValue.value) {
      done()
      return
    }
    if (idx === currentValue.value)
      el.style.transform = `translateY(calc(${space}rem + ${(1 + idx - trueValue.value) * 100}vh))`
    if (idx === currentValue.value - 1) {
      const progress = trueValue.value - idx - 1
      el.style.transform = `scale(${1 - progress * scale / 100})`
      el.style.filter = `brightness(${100 - 10 * progress}%)`
    }
    requestAnimationFrame(cb)
  }
  requestAnimationFrame(cb)
}

const throttlePush = useThrottleFn((d: any) => {
  data.push(d)
}, duration)

iosBottomSheetEventBus.on('push', (d) => {
  throttlePush(d)
})

const throttlePop = useThrottleFn(() => {
  if (data.length > 1)
    data.pop()
}, duration)

const closeSheet = useThrottleFn((e: PointerEvent, i: number) => {
  if (i === currentValue.value - 2 && !(e.target as Element | null)?.classList.contains('ios-sheet-wrapper'))
    return
  throttlePop()
}, duration)

const dragStartPos = ref({ x: 0, y: 0 })
const progress = ref(0)
function onDragStart(e: PointerEvent) {
  e.preventDefault()
  isDragging.value = true
  dragStartPos.value = { x: e.clientX, y: e.clientY }
}

let lastEventTime = window.performance.now()
let lastEventY = 0
let speedY = 0
let timerId: number | null = null
const touchStartY = ref(0)
const currentEl = computed(() => {
  return document.querySelector(`[data-index="${length.value - 1}"]`) as HTMLDivElement | null
})
const scrollable = computed(() => {
  return currentEl.value && currentEl.value.scrollHeight > currentEl.value.clientHeight
})
function onDrag(e: PointerEvent) {
  e.preventDefault()
  // 如果 Sheet 可以滚动，且向下滚动，则触发滚动，而不是拖动 Sheet
  if (scrollable.value && touchStartY.value - e.clientY > 0)
    return
  // if not dragging, return
  if (!isDragging.value)
    return
  const currentEventTime = window.performance.now()
  const timeDifference = currentEventTime - lastEventTime
  const dy = e.clientY - lastEventY
  speedY = dy / timeDifference // speed in px/ms
  // if speedY > 0, means dragging down, and Sheet is not at top, return
  if (speedY > 0 && currentEl.value?.scrollTop !== 0)
    return
  // update lastEventTime and lastEventY
  lastEventTime = currentEventTime
  lastEventY = e.clientY
  const diff = e.clientY - dragStartPos.value.y
  const height = window.innerHeight
  progress.value = diff / height
  // clear previous timer
  if (timerId !== null)
    clearTimeout(timerId)

  // set a new timer
  timerId = setTimeout(() => {
    speedY = 0
  }, 100) // if no event in 100ms, reset speedY to 0
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

function touchStart(event: TouchEvent) {
  touchStartY.value = event.touches[0].clientY
}
function touchMove(event: TouchEvent) {
  const eventY = event.touches[0].clientY
  const diff = eventY - touchStartY.value
  if ((!scrollable.value || (diff > 0 && currentEl.value?.scrollTop === 0)) && event.cancelable)
    event.preventDefault() // enable scroll sheet itself
}
watchEffect(() => {
  if (data.length > 1) {
    document.addEventListener('touchstart', touchStart, { passive: false })
    document.addEventListener('touchmove', touchMove, { passive: false })
  }
  else {
    document.removeEventListener('touchmove', touchMove)
  }
})
const baseRef = ref<HTMLElement | null>(null)
let baseBGInterpolate: (t: number) => string = () => ''
onMounted(() => {
  if (baseRef.value) {
    const el = baseRef.value.nextElementSibling as any
    const fromBGColor = el?.computedStyleMap().get('background-color')?.toString()
    if (fromBGColor)
      baseBGInterpolate = interpolateRgb(fromBGColor, finalSheetBgColor)
  }
})
const baseWrapperStyle = computed(() => {
  const progress = trueValue.value - 1
  if (progress >= 0) {
    return {
      transform: `translateY(calc(${space * progress}rem)) scale(${1 - progress * scale / 100})`,
      filter: `brightness(${100 - 10 * (progress)}%)`,
      borderRadius: `${0.5 * progress}rem`,
      backgroundColor: baseBGInterpolate(progress),
    }
  }
  return ''
})
const finalSheetClass = computed(() => {
  return `fixed inset-0 origin-top overflow-auto ${sheetClass}`
})
const finalBaseClass = computed(() => {
  if (data.length > 1)
    return `fixed inset-0 origin-top overflow-auto ${sheetClass}`
  return 'origin-top'
})

const baseLeave: any = (_: never, done: () => void) => setTimeout(done, duration)
</script>

<template>
  <div class="w-full min-h-[100vh] bg-black">
    <TransitionGroup :css="false" @leave="baseLeave">
      <div v-if="data.length <= 2" :class="finalBaseClass" :style="baseWrapperStyle">
        <component :is="data[0]" ref="baseRef" />
      </div>
    </TransitionGroup>
    <TransitionGroup :css="false" @leave="onLeave">
      <template v-for="(sheet, i) in data" :key="i">
        <div
          v-if="i > 0 && (i === currentValue - 2 || i === currentValue - 1)"
          v-on-click-outside="(el) => closeSheet(el, i)" :data-index="i" :style="sheetStyle(i)" :class="finalSheetClass"
          @pointerdown="onDragStart" @pointermove="onDrag" @pointerup="onDragEnd"
        >
          <component :is="sheet" />
        </div>
      </template>
    </TransitionGroup>
  </div>
</template>
