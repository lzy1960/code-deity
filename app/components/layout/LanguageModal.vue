<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative m-4 w-full max-w-sm rounded-2xl bg-gray-900 p-6 shadow-xl">
        <h2 class="mb-6 text-center text-2xl font-bold text-white">
          {{ $t('common.selectLanguage') }}
        </h2>
        <div class="space-y-3">
          <button
            v-for="locale in locales"
            :key="locale.code"
            @click="switchLanguage(locale.code)"
            class="w-full rounded-lg px-5 py-3 text-lg font-bold transition-colors duration-200"
            :class="currentLocale === locale.code ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            {{ locale.name }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useLanguageModal } from '~/composables/useLanguageModal';

const modal = useLanguageModal();
const { locales, locale: currentLocale, setLocale } = useI18n();

const switchLanguage = (code: string) => {
  setLocale(code);
  modal.hide();
};
</script>

<style scoped>
.modal-bounce-enter-active,
.modal-bounce-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-bounce-enter-from,
.modal-bounce-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
