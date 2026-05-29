<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative m-4 w-full max-w-sm rounded-2xl bg-transparent p-0 shadow-2xl overflow-hidden border border-purple-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] p-4">
          <h2 class="mb-4 text-center text-base font-bold text-purple-300">
            {{ $t('common.selectLanguage') }}
          </h2>
          <div class="space-y-2">
            <button
              v-for="locale in locales"
              :key="locale.code"
              @click="switchLanguage(locale.code)"
              class="w-full rounded-lg px-4 py-2 text-sm font-bold transition-colors duration-200"
              :class="currentLocale === locale.code ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            >
              {{ locale.name }}
            </button>
          </div>
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
  setLocale(code as 'en' | 'zh-CN');
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
.animated-border {
  position: absolute;
  top: 50%; left: 50%;
  width: 200%; height: 200%;
  background: conic-gradient(transparent, rgba(192, 132, 252, 0.7), transparent 35%);
  transform: translate(-50%, -50%);
  animation: rotate 5s cubic-bezier(0.65, -0.5, 0.25, 1.5) infinite;
  z-index: 0;
}
@keyframes rotate {
  0%   { transform: translate(-50%, -50%) rotate(0deg)   scale(1);   opacity: 0.7; }
  50%  { transform: translate(-50%, -50%) rotate(180deg) scale(1.1); opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(360deg) scale(1);   opacity: 0.7; }
}
</style>
