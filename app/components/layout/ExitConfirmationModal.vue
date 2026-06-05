<template>
  <Transition name="modal-panel">
    <div v-if="isVisible" class="modal-backdrop" @click.self="hide">
      <section class="system-modal">
          <h2 class="modal-title">
            {{ $t('common.confirmExit') }}
          </h2>
          <p class="modal-copy">
            {{ $t('common.confirmCloseApp') }}
          </p>
          <div class="action-row">
            <button
              class="secondary-action"
              @click="hide"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              class="danger-action"
              @click="confirm"
            >
              {{ $t('common.exit') }}
            </button>
          </div>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useExitConfirmationModal } from '~/composables/useExitConfirmationModal'

const { isVisible, hide, confirm } = useExitConfirmationModal()

watch(isVisible, (newValue) => {
  if (newValue) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})
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
  border: 1px solid rgba(76, 165, 255, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.98), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 12% 0%, rgba(76, 165, 255, 0.16), transparent 36%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42), inset 0 0 36px rgba(0, 0, 0, 0.26);
  padding: 16px;
}

.modal-title {
  color: #f8fbff;
  font-size: 1rem;
  font-weight: 900;
  text-align: center;
}

.modal-copy {
  margin: 12px 0 16px;
  color: #b9cde0;
  font-size: 0.78rem;
  line-height: 1.55;
  text-align: center;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.secondary-action,
.danger-action {
  min-height: 40px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 900;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.secondary-action {
  border: 1px solid rgba(142, 173, 204, 0.26);
  background: rgba(15, 23, 42, 0.56);
  color: #cfe3f5;
}

.secondary-action:hover {
  border-color: rgba(76, 165, 255, 0.44);
  background: rgba(76, 165, 255, 0.14);
}

.danger-action {
  border: 1px solid rgba(248, 113, 113, 0.34);
  background: rgba(127, 29, 29, 0.42);
  color: #fee2e2;
}

.danger-action:hover {
  border-color: rgba(252, 165, 165, 0.6);
  background: rgba(127, 29, 29, 0.58);
}
</style>
