<template>
  <div v-if="generator" class="flex items-center gap-4 rounded-lg bg-[#191933] p-3">
    <div class="flex-grow">
      <p class="text-base font-medium">{{ config.name }}: <span class="font-bold text-green-400">{{ formattedAmount }}</span></p>
            <p class="text-sm text-[#9292c9]">Multiplier: x{{ gameStore.buy10Bonus(generatorId).toFixed(1) }}</p>
          </div>
          <button
            class="flex min-w-[100px] cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-bold text-white transition-colors"
            :class="canBuy ? 'bg-[#232348] hover:bg-[#343466]' : 'bg-gray-500 cursor-not-allowed'"
            :disabled="!canBuy"
            @click="buy"
          >
            <span class="truncate">Buy ({{ formattedCost }})</span>
          </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '~/store/game';

const props = defineProps<{
  generatorId: number;
}>();

const emit = defineEmits(['buy']);

const gameStore = useGameStore();

const generator = computed(() => gameStore.generators.find(g => g.id === props.generatorId));
const config = computed(() => gameStore.generatorConfig(props.generatorId));
const cost = computed(() => gameStore.generatorCost(props.generatorId));
const canBuy = computed(() => gameStore.currency.gte(cost.value));

const formattedAmount = computed(() => {
  if (!generator.value) return '0';
  return new Intl.NumberFormat('en-US').format(Math.floor(generator.value.amount.toNumber()));
});

const formattedCost = computed(() => {
  const costValue = cost.value;
  if (costValue.lt(1000)) {
    return costValue.toFixed(0);
  }
  return costValue.toExponential(2);
});

const buy = () => {
  if (canBuy.value) {
    emit('buy');
  }
};
</script>
