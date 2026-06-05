import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { createSharedComposable } from '@vueuse/core'

/**
 * Factory for global, single-instance modals shared across the app.
 * 取代了之前 7 个 useXxxModal 文件中重复的 isRevealed/show/hide/confirm 模板。
 * 全部基于 createSharedComposable，确保 SSR 下不会跨请求泄漏状态。
 */

export interface SimpleModal {
  isRevealed: Ref<boolean>
  show: () => void
  hide: () => void
}

export interface ConfirmModal {
  isRevealed: Ref<boolean>
  show: (onConfirm: () => void) => void
  hide: () => void
  confirm: () => void
}

export interface PayloadModal<P> {
  isRevealed: Ref<boolean>
  payload: ShallowRef<P | null>
  show: (payload: P, onConfirm: () => void) => void
  hide: () => void
  confirm: () => void
}

/** 仅 show/hide 的简单弹窗（帮助、语言切换、创世日志等）。 */
export function createSimpleModal() {
  return createSharedComposable<() => SimpleModal>(() => {
    const isRevealed = ref(false)
    return {
      isRevealed,
      show: () => { isRevealed.value = true },
      hide: () => { isRevealed.value = false },
    }
  })
}

/** show 时传入确认回调的弹窗（奇点重置、退出等）。 */
export function createConfirmModal() {
  return createSharedComposable<() => ConfirmModal>(() => {
    const isRevealed = ref(false)
    let onConfirm: (() => void) | null = null
    const hide = () => {
      isRevealed.value = false
      onConfirm = null
    }
    return {
      isRevealed,
      show: (cb: () => void) => {
        onConfirm = cb
        isRevealed.value = true
      },
      hide,
      confirm: () => {
        if (onConfirm) onConfirm()
        hide()
      },
    }
  })
}

/** show 时同时传入 payload 与确认回调的弹窗（重构详情、范式购买等）。 */
export function createPayloadModal<P>() {
  return createSharedComposable<() => PayloadModal<P>>(() => {
    const isRevealed = ref(false)
    const payload = shallowRef<P | null>(null)
    let onConfirm: (() => void) | null = null
    const hide = () => {
      isRevealed.value = false
      payload.value = null
      onConfirm = null
    }
    return {
      isRevealed,
      payload,
      show: (p: P, cb: () => void) => {
        payload.value = p
        onConfirm = cb
        isRevealed.value = true
      },
      hide,
      confirm: () => {
        if (onConfirm) onConfirm()
        hide()
      },
    }
  })
}
