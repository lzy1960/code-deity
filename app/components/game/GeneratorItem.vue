<template>
  <div v-if="generator" class="flex items-center gap-4 rounded-lg bg-[#191933] p-3">
    <div class="flex-grow">
      <p class="text-base font-medium">{{ config.name }}: <span class="font-bold text-green-400">{{ formattedAmount }}</span> <span v-if="gameStore.buyMultiplier !== 'x1' && buyAmount.gt(0)" class="text-cyan-400">(+{{ formatNumber(buyAmount) }})</span></p>
      <p class="text-sm text-[#9292c9]">Multiplier: x{{ formatNumber(gameStore.buy10Bonus(generatorId)) }}</p>
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
import { formatNumber } from '~/utils/format';

const props = defineProps<{
  generatorId: number;
}>();

const emit = defineEmits(['buy']);

const gameStore = useGameStore();

const generator = computed(() => gameStore.generators.find(g => g.id === props.generatorId));
const config = computed(() => gameStore.generatorConfig(props.generatorId));
const buyAmount = computed(() => gameStore.buyAmount(props.generatorId));
const cost = computed(() => gameStore.costForAmount(props.generatorId, buyAmount.value));
const canBuy = computed(() => gameStore.currency.gte(cost.value) && buyAmount.value.gt(0));

const formattedAmount = computed(() => {
  return generator.value ? formatNumber(generator.value.amount) : '0';
});

const formattedCost = computed(() => {
  return formatNumber(cost.value);
});

const buy = () => {
  if (canBuy.value) {
    emit('buy');
  }
};
</script>
