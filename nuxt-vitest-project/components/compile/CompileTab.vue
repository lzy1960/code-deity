<template>
  <div>
    <h2>Compile</h2>
    <p>Version Points: {{ format(player.versionPoints) }}</p>
    <p>Current Version: {{ currentVersion }}</p>
    <p>Cost to Compile: {{ format(compileCost) }} Refactor Points</p>
    <button @click="performCompile" :disabled="!canCompile">Compile</button>

    <h3>Version Upgrades</h3>
    <ul>
      <li v-for="(cost, index) in gameConfig.compile_version_unlock_costs" :key="index">
        Version {{ index + 2 }}: Cost {{ cost }} Version Points
        <button
          @click="unlockVersion(index + 2)"
          :disabled="player.versionPoints.lessThan(cost) || currentVersion >= index + 2"
        >
          Unlock
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Decimal } from 'decimal.js';
import { usePlayerStore } from '../../game/state/playerStore';
import { useGeneratorsStore } from '../../game/state/generatorsStore';
import gameConfig from '../../gameConfig';

const player = usePlayerStore();
const generators = useGeneratorsStore();

const compileCost = computed(() => {
  return new Decimal(gameConfig.compile_cost_base).times(
    new Decimal(gameConfig.compile_cost_exponent).pow(player.versionPoints)
  );
});

const canCompile = computed(() => player.refactorPoints.greaterThanOrEqualTo(compileCost.value));

const currentVersion = computed(() => {
  let version = 1;
  for (let i = 0; i < gameConfig.compile_version_unlock_costs.length; i++) {
    if (player.versionPoints.greaterThanOrEqualTo(gameConfig.compile_version_unlock_costs[i])) {
      version = i + 2;
    } else {
      break;
    }
  }
  return version;
});

function format(amount: Decimal) {
  return amount.toDecimalPlaces(2).toString();
}

function performCompile() {
  if (player.refactorPoints.greaterThanOrEqualTo(compileCost.value)) {
    player.addVersionPoints(new Decimal(gameConfig.compile_point_gain_base));
    // Reset all game state for a hard reset
    player.hardResetPlayerState();
    generators.$reset();
  }
}

function unlockVersion(versionNumber: number) {
  // This is a placeholder. In a real game, unlocking a version would likely
  // involve spending version points and applying permanent upgrades.
  console.log(`Unlocking Version ${versionNumber}`);
}
</script>