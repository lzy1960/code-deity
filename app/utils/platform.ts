import { ref, onMounted, readonly } from 'vue';
import { Capacitor } from '@capacitor/core';

/**
 * A composable that provides a reactive boolean indicating if the app is running on a native platform.
 * @returns {Readonly<Ref<boolean>>} A readonly ref that is true if the app is native, false otherwise.
 */
export function useIsNative() {
  const isNative = ref(false);

  onMounted(() => {
    isNative.value = Capacitor.isNativePlatform();
  });

  return readonly(isNative);
}
