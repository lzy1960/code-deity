<template>
  <section class="challenge-panel">
    <header class="section-header">
      <div>
        <p>CHALLENGE MATRIX</p>
        <h2>{{ $t('common.challenges') }}</h2>
      </div>
      <span>{{ completedCount }}/4</span>
    </header>

    <div class="challenge-list">
      <ChallengeItem
        :title="$t('challenges.challenge1Title')"
        :rule="$t('challenges.challenge1Rule')"
        :goal="$t('challenges.challenge1Goal')"
        :reward="$t('challenges.challenge1Reward')"
        :is-completed="gameStore.challengeCompletions.challenge1"
        :is-active="gameStore.activeChallenge === 'challenge1'"
        :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
        @start="gameStore.startChallenge('challenge1')"
        @exit="gameStore.exitChallenge"
      />

      <ChallengeItem
        :title="$t('challenges.challenge2Title')"
        :rule="$t('challenges.challenge2Rule')"
        :goal="$t('challenges.challenge2Goal')"
        :reward="$t('challenges.challenge2Reward')"
        :is-completed="gameStore.challengeCompletions.challenge2"
        :is-active="gameStore.activeChallenge === 'challenge2'"
        :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
        @start="gameStore.startChallenge('challenge2')"
        @exit="gameStore.exitChallenge"
      />

      <ChallengeItem
        :title="$t('challenges.challenge3Title')"
        :rule="$t('challenges.challenge3Rule')"
        :goal="$t('challenges.challenge3Goal')"
        :reward="$t('challenges.challenge3Reward')"
        :is-completed="gameStore.challengeCompletions.challenge3"
        :is-active="gameStore.activeChallenge === 'challenge3'"
        :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
        @start="gameStore.startChallenge('challenge3')"
        @exit="gameStore.exitChallenge"
      />

      <ChallengeItem
        :title="$t('challenges.challenge4Title')"
        :rule="$t('challenges.challenge4Rule')"
        :goal="$t('challenges.challenge4Goal')"
        :reward="$t('challenges.challenge4Reward')"
        :is-completed="gameStore.challengeCompletions.challenge4"
        :is-active="gameStore.activeChallenge === 'challenge4'"
        :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
        @start="gameStore.startChallenge('challenge4')"
        @exit="gameStore.exitChallenge"
      />

      <div class="coming-soon">
        <p>{{ $t('common.moreChallengesComingSoon') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '~/store/game';
import ChallengeItem from './ChallengeItem.vue';

const gameStore = useGameStore();

const completedCount = computed(() => Object.values(gameStore.challengeCompletions).filter(Boolean).length)
</script>

<style scoped>
.challenge-panel {
  display: grid;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(56, 153, 250, 0.18);
  border-radius: 8px;
  background: rgba(13, 26, 40, 0.82);
  padding: 12px 14px;
}

.section-header p {
  color: #3899fa;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.section-header h2 {
  color: #e5f3ff;
  font-size: 1rem;
  font-weight: 800;
}

.section-header span {
  color: #86efac;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-weight: 900;
}

.challenge-list {
  display: grid;
  gap: 10px;
}

.coming-soon {
  border: 1px dashed rgba(142, 173, 204, 0.24);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.52);
  padding: 16px;
  text-align: center;
}

.coming-soon p {
  color: #8eadcc;
  font-size: 0.78rem;
}
</style>
