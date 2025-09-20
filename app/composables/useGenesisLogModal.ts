import { ref } from 'vue';

const isRevealed = ref(false);

export function useGenesisLogModal() {
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
