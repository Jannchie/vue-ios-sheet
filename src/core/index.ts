import { inject } from 'vue'

export const iosBottomSheet = Symbol('iosBottomSheet')

export function usePush(component: any) {
  const data = inject<any>(iosBottomSheet)
  if (data)
    data.push(component)
}
