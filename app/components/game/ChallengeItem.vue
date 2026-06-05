<template>
  <article class="challenge-card" :class="stateClass">
    <header class="challenge-head">
      <div>
        <p class="challenge-kicker">CONSTRAINT TEST</p>
        <h3>{{ title }}</h3>
      </div>
      <span class="challenge-status">
        <Icon :name="statusIcon" />
        {{ statusLabel }}
      </span>
    </header>

    <div class="challenge-body">
      <p><span>{{ $t('common.rule') }}</span>{{ rule }}</p>
      <p><span>{{ $t('common.goal') }}</span>{{ goal }}</p>
      <p class="reward"><span>{{ $t('common.reward') }}</span>{{ reward }}</p>
    </div>

    <button v-if="isCompleted" class="challenge-button completed" disabled>
      <Icon name="ph:check-circle-bold" />
      {{ $t('common.completed') }}
    </button>
    <button v-else-if="isActive" class="challenge-button exit" @click="$emit('exit')">
      <Icon name="ph:x-circle-bold" />
      {{ $t('common.exitChallenge') }}
    </button>
    <button v-else class="challenge-button start" :disabled="isAnyChallengeActive" @click="$emit('start')">
      <Icon name="ph:play-circle-bold" />
      {{ $t('common.startChallenge') }}
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  rule: string
  goal: string
  reward: string
  isCompleted: boolean
  isActive: boolean
  isAnyChallengeActive: boolean
}>()

defineEmits(['start', 'exit'])

const stateClass = computed(() => {
  if (props.isCompleted) return 'completed'
  if (props.isActive) return 'active'
  if (props.isAnyChallengeActive) return 'disabled'
  return 'idle'
})

const statusLabel = computed(() => {
  if (props.isCompleted) return 'DONE'
  if (props.isActive) return 'ACTIVE'
  if (props.isAnyChallengeActive) return 'STANDBY'
  return 'READY'
})

const statusIcon = computed(() => {
  if (props.isCompleted) return 'mdi:check-decagram-outline'
  if (props.isActive) return 'mdi:alert-decagram-outline'
  if (props.isAnyChallengeActive) return 'mdi:pause-circle-outline'
  return 'mdi:play-circle-outline'
})
</script>

<style scoped>
.challenge-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(56, 153, 250, 0.14);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(13, 26, 40, 0.92), rgba(8, 15, 24, 0.96)),
    radial-gradient(circle at 0% 0%, rgba(56, 153, 250, 0.12), transparent 34%);
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.22);
  padding: 13px;
  transition: opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.challenge-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(255, 255, 255, 0.016) 5px, rgba(255, 255, 255, 0.016) 6px);
}

.challenge-card.active {
  border-color: rgba(56, 153, 250, 0.44);
  box-shadow: 0 0 18px rgba(56, 153, 250, 0.12), inset 0 0 24px rgba(0, 0, 0, 0.22);
}

.challenge-card.completed {
  border-color: rgba(74, 222, 128, 0.28);
}

.challenge-card.disabled {
  opacity: 0.54;
}

.challenge-head,
.challenge-body,
.challenge-button {
  position: relative;
  z-index: 1;
}

.challenge-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.challenge-kicker {
  color: #3899fa;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.challenge-head h3 {
  margin-top: 2px;
  color: #e5f3ff;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.25;
}

.challenge-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(56, 153, 250, 0.18);
  border-radius: 999px;
  color: #7dd3fc;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  padding: 4px 8px;
  white-space: nowrap;
}

.completed .challenge-status {
  border-color: rgba(74, 222, 128, 0.28);
  color: #86efac;
}

.active .challenge-status {
  border-color: rgba(251, 191, 36, 0.34);
  color: #fbbf24;
}

.challenge-body {
  display: grid;
  gap: 7px;
  margin: 12px 0;
}

.challenge-body p {
  color: #bac8d8;
  font-size: 0.74rem;
  line-height: 1.45;
}

.challenge-body span {
  display: inline-block;
  min-width: 3rem;
  color: #8eadcc;
  font-weight: 800;
}

.challenge-body .reward {
  color: #7dd3fc;
}

.challenge-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  min-height: 38px;
  border: 1px solid rgba(56, 153, 250, 0.34);
  border-radius: 8px;
  background: rgba(56, 153, 250, 0.16);
  color: #e5f3ff;
  font-size: 0.78rem;
  font-weight: 900;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.challenge-button:not(:disabled):hover {
  border-color: rgba(125, 211, 252, 0.58);
  background: rgba(56, 153, 250, 0.26);
  transform: translateY(-1px);
}

.challenge-button.exit {
  border-color: rgba(251, 146, 60, 0.38);
  background: rgba(124, 45, 18, 0.36);
  color: #fed7aa;
}

.challenge-button.completed {
  border-color: rgba(74, 222, 128, 0.3);
  background: rgba(5, 46, 22, 0.34);
  color: #86efac;
}

.challenge-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>
