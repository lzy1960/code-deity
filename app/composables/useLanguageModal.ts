import { ref } from 'vue';

const isRevealed = ref(false);

export function useLanguageModal() {
  return {
    isRevealed,
    show: () => {
      isRevealed.value = true;
    },
    hide: () => {
      isRevealed.value = false;
    },
  };
}
