<template>
  <div v-if="generator" class="bg-[#182635] rounded-lg overflow-hidden">
    <div class="flex items-stretch">
      <div class="flex-[2_2_0px] p-3 flex flex-col justify-between">
        <div>
          <h3 class="text-white text-sm font-bold leading-tight">{{ localizedName }}</h3>
          <p class="text-[#8eadcc] text-xs font-normal leading-normal">
            {{ $t('common.quantity') }}: {{ formattedAmount }} 
            <span v-if="buyAmount.gt(0)" class="text-cyan-400">(+{{ formatNumber(buyAmount) }})</span>
          </p>
        </div>
        <div class="mt-2">
          <p class="text-white text-xs font-medium leading-normal">{{ $t('common.multiplier') }}: x{{ formatNumber(gameStore.buy10Bonus(generatorId)) }}</p>
          <div class="rounded-full bg-[#2f4d6a] mt-1 h-2 w-full" :title="$t('generatorItem.nextBonusHint', { nextBonus: progressInfo.nextBonus })">
            <div class="h-2 rounded-full bg-[#3899fa]" :style="{ width: `${progressInfo.progress}%` }"></div>
          </div>
        </div>
      </div>
      <div class="relative flex-1">
        <button 
          class="w-full h-full bg-[#21364a] transition-colors text-white flex flex-col items-center justify-center p-3 gap-1"
          :class="{
            'hover:bg-blue-500 cursor-pointer bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]': canBuy,
            'bg-gray-700/50 cursor-not-allowed': !canBuy
          }"
          :disabled="!canBuy"
          @click="buy"
        >
          <span class="absolute top-1.5 right-1.5 text-xs font-bold rounded-full bg-black/30 text-white px-2 py-0.5">
            {{ gameStore.buyMultiplier === 'max' ? $t('common.max') : gameStore.buyMultiplier }}
          </span>
          <Icon name="mdi:cart" class="text-lg" />
          <p class="text-xs font-medium text-gray-300 mt-1">{{ $t('common.cost') }}:</p>
          <div v-if="discountedCost">
            <p class="text-xs font-bold text-gray-500 line-through">{{ formattedCost }}</p>
            <p class="text-sm font-bold text-green-400">{{ formatNumber(discountedCost) }}</p>
          </div>
          <p v-else class="text-sm font-bold">{{ formattedCost }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Decimal from 'break_infinity.js';
import { computed } from 'vue';
import { useGameStore } from '~/store/game';
import { formatNumber, getLocalizedGameName } from '~/utils/format';

const props = defineProps<{
  generatorId: number;
  discountedCost?: Decimal;
}>();

const emit = defineEmits(['buy']);

const gameStore = useGameStore();
const { locale } = useI18n();

const generator = computed(() => gameStore.generators.find(g => g.id === props.generatorId));
const config = computed(() => gameStore.generatorConfig(props.generatorId));
const buyAmount = computed(() => gameStore.buyAmount(props.generatorId));
const cost = computed(() => gameStore.costForAmount(props.generatorId, buyAmount.value));
const canBuy = computed(() => {
  const finalCost = props.discountedCost ?? cost.value;
  return gameStore.currency.gte(finalCost) && buyAmount.value.gt(0)
});

const formattedAmount = computed(() => {
  return generator.value ? formatNumber(generator.value.amount) : '0';
});

const formattedCost = computed(() => {
  // If 'max' is selected and we can't afford to buy any...
  if (gameStore.buyMultiplier === 'max' && buyAmount.value.eq(0)) {
    // ...display the cost for a single item.
    const costForOne = gameStore.costForAmount(props.generatorId, new Decimal(1));
    return formatNumber(costForOne);
  }
  // Otherwise, display the cost for the amount we can actually buy.
  return formatNumber(cost.value);
});

const progressInfo = computed(() => {
  if (!generator.value) return { progress: 0, nextBonus: 0 };
  return gameStore.getProgressInfo(props.generatorId);
});

const localizedName = computed(() => getLocalizedGameName(config.value.name, locale.value));

const buy = () => {
  if (canBuy.value) {
    emit('buy');
  }
};
</script>
