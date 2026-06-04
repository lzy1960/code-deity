import { ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';

const STORAGE_KEY = 'code-deity-onboarding-v1';
const CODE_RUSH_STORAGE_KEY = 'code-deity-onboarding-coderush';

export const useOnboarding = createSharedComposable(() => {
  const shouldShowTour = ref(false);
  const shouldShowCodeRushTour = ref(false);

  function checkTourStatus() {
    try {
      shouldShowTour.value = localStorage.getItem(STORAGE_KEY) !== 'done';
      shouldShowCodeRushTour.value = localStorage.getItem(CODE_RUSH_STORAGE_KEY) !== 'done';
    } catch {
      shouldShowTour.value = true;
      shouldShowCodeRushTour.value = true;
    }
  }

  function completeTour() {
    shouldShowTour.value = false;
    try {
      localStorage.setItem(STORAGE_KEY, 'done');
    } catch {}
  }

  function completeCodeRushTour() {
    shouldShowCodeRushTour.value = false;
    try {
      localStorage.setItem(CODE_RUSH_STORAGE_KEY, 'done');
    } catch {}
  }

  function resetTour() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CODE_RUSH_STORAGE_KEY);
    } catch {}
    shouldShowTour.value = true;
    shouldShowCodeRushTour.value = true;
  }

  checkTourStatus();

  return { shouldShowTour, shouldShowCodeRushTour, completeTour, completeCodeRushTour, resetTour };
});
