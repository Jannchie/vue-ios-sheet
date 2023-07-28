import type { AnyFn } from '@vueuse/core'
import SheetWrapper from './SheetWrapper.vue'
import 'uno.css'

export const iosBottomSheet = Symbol('iosBottomSheet')

type SheetEvent = 'push'

// 事件总线对象
export const iosBottomSheetEventBus = {
  events: {
    push: [] as AnyFn[],
  },
  // 注册事件监听器
  on(event: SheetEvent, callback: AnyFn) {
    if (!this.events[event])
      this.events[event] = []

    this.events[event].push(callback)
  },
  emit(event: SheetEvent, data: any) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => {
        callback(data)
      })
    }
  },
  off(event: SheetEvent, callback: AnyFn) {
    if (this.events[event])
      this.events[event] = this.events[event].filter(cb => cb !== callback)
  },
}

export function pushSheet(component: any) {
  iosBottomSheetEventBus.emit('push', component)
}

export { SheetWrapper }
