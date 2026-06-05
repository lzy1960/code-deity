<template>
  <Transition name="modal-panel">
    <div v-if="modal.isRevealed.value" class="modal-backdrop" @click.self="modal.hide()">
      <section class="system-modal">
        <header class="modal-header">
          <div>
            <p>LOCALE ROUTER</p>
            <h2>{{ $t('common.selectLanguage') }}</h2>
          </div>
          <button class="icon-close" @click="modal.hide()">
            <Icon name="mdi:close" />
          </button>
        </header>

        <div class="language-list">
          <button
            v-for="locale in locales"
            :key="locale.code"
            @click="switchLanguage(locale.code)"
            class="language-option"
            :class="{ active: currentLocale === locale.code }"
          >
            <span>{{ locale.name }}</span>
            <Icon v-if="currentLocale === locale.code" name="mdi:check" />
          </button>
        </div>
      </section>
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
.modal-panel-enter-active,
.modal-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  padding: 16px;
}

.system-modal {
  width: min(100%, 380px);
  overflow: hidden;
  border: 1px solid rgba(56, 153, 250, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(13, 26, 40, 0.96), rgba(8, 15, 24, 0.98)),
    radial-gradient(circle at 12% 0%, rgba(56, 153, 250, 0.11), transparent 34%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42), inset 0 0 36px rgba(0, 0, 0, 0.32);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(56, 153, 250, 0.14);
  padding: 14px;
}

.modal-header p {
  color: #3899fa;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.modal-header h2 {
  margin-top: 3px;
  color: #e5f3ff;
  font-size: 1rem;
  font-weight: 800;
}

.icon-close {
  display: grid;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid rgba(142, 173, 204, 0.18);
  border-radius: 8px;
  color: #8eadcc;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.icon-close:hover {
  border-color: rgba(56, 153, 250, 0.34);
  background: rgba(56, 153, 250, 0.12);
  color: #e5f3ff;
}

.language-list {
  display: grid;
  gap: 8px;
  padding: 14px;
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  border: 1px solid rgba(56, 153, 250, 0.12);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.68);
  color: #8eadcc;
  font-size: 0.86rem;
  font-weight: 800;
  padding: 0 12px;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.language-option:hover,
.language-option.active {
  border-color: rgba(56, 153, 250, 0.38);
  background: rgba(56, 153, 250, 0.16);
  color: #e5f3ff;
}
</style>
