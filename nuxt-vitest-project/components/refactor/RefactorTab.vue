<template>
  <div>
    <h2>Refactor</h2>
    <p>Refactor Points: {{ format(player.refactorPoints) }}</p>
    <p>Cost to Refactor: {{ format(refactorCost) }} Money</p>
    <button @click="performRefactor" :disabled="!canRefactor">Refactor</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Decimal } from 'decimal.js';
import { usePlayerStore } from '../../game/state/playerStore';
import gameConfig from '../../gameConfig';

const player = usePlayerStore();

const refactorCost = computed(() => {
  return new Decimal(gameConfig.refactor_cost_base).times(
    new Decimal(gameConfig.refactor_cost_exponent).pow(player.refactorPoints)
  );
});

const canRefactor = computed(() => player.money.greaterThanOrEqualTo(refactorCost.value));

function format(amount: Decimal) {
  return amount.toDecimalPlaces(2).toString();
}

function performRefactor() {
  if (player.deductMoney(refactorCost.value)) {
    player.addRefactorPoints(new Decimal(gameConfig.refactor_point_gain_base));
    // Here you would also reset other game state, like generators, money, etc.
    // For now, we'll just reset money and generators.
    player.resetPlayerState();
    // You might also want to reset generatorsStore here
    // useGeneratorsStore().$reset(); // Assuming generatorsStore has a $reset action
  }
}
</script>