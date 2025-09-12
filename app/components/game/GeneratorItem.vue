<template>
  <div v-if="generator" class="bg-[#182635] rounded-lg overflow-hidden">
    <div class="flex items-stretch">
      <div class="flex-[2_2_0px] p-4 flex flex-col justify-between">
        <div>
          <h3 class="text-white text-lg font-bold leading-tight">{{ config.name }}</h3>
          <p class="text-[#8eadcc] text-sm font-normal leading-normal">Quantity: {{ formattedAmount }} <span v-if="buyAmount.gt(0)" class="text-cyan-400">(+{{ formatNumber(buyAmount) }})</span></p>
        </div>
        <div class="mt-2">
          <p class="text-white text-sm font-medium leading-normal">Multiplier: x{{ formatNumber(gameStore.buy10Bonus(generatorId)) }}</p>
          <div class="rounded-full bg-[#2f4d6a] mt-1 h-2 w-full">
            <div class="h-2 rounded-full bg-[#3899fa]" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
        </div>
      </div>
      <button 
        class="flex-1 bg-[#21364a] transition-colors text-white flex flex-col items-center justify-center p-4 gap-1"
        :class="canBuy ? 'hover:bg-[#2a4058] cursor-pointer' : 'bg-gray-600/50 cursor-not-allowed'"
        :disabled="!canBuy"
        @click="buy"
      >
        <div class="relative">
          <span v-if="gameStore.buyMultiplier !== 'max'" class="text-xs font-bold rounded-full bg-[#3899fa] text-white px-2 py-0.5 absolute -top-4 -right-4 border-2 border-[#21364a]">{{ gameStore.buyMultiplier }}</span>
          <span v-else class="text-xs font-bold rounded-full bg-[#3899fa] text-white px-2 py-0.5 absolute -top-4 -right-6 border-2 border-[#21364a]">Max ({{ formatNumber(buyAmount) }})</span>
          <span class="material-symbols-outlined text-xl"> shopping_cart </span>
        </div>
        <p class="text-xs font-medium text-gray-300">Cost:</p>
        <p class="text-lg font-bold">{{ formattedCost }}</p>
      </button>
    </div>
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

const progressPercentage = computed(() => {
  if (!generator.value) return 0;
  return (generator.value.bought % 10) * 10;
});

const buy = () => {
  if (canBuy.value) {
    emit('buy');
  }
};
</script>
