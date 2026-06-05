<template>
  <article v-if="generator" class="generator-row" :class="{ affordable: canBuy }">
    <div class="generator-main">
      <div class="tier-badge">
        <span>T{{ String(generatorId).padStart(2, '0') }}</span>
      </div>

      <div class="generator-copy">
        <div class="title-line">
          <h3>{{ localizedName }}</h3>
          <span class="amount-chip">
            {{ $t('common.quantity') }}
            <b>{{ formattedAmount }}</b>
            <i v-if="buyAmount.gt(0)">+{{ formatNumber(buyAmount) }}</i>
          </span>
        </div>

        <div class="bonus-strip">
          <div class="bonus-meta">
            <span>x{{ formatNumber(gameStore.buy10Bonus(generatorId)) }}</span>
            <small>{{ formattedProgress }}%</small>
          </div>
          <div class="progress-track" :title="$t('generatorItem.nextBonusHint', { nextBonus: progressInfo.nextBonus })">
            <div :style="{ width: `${progressWidth}%` }" />
          </div>
        </div>
      </div>
    </div>

    <button
      :data-onboarding="generatorId === 1 ? 'generator-buy' : undefined"
      class="buy-button"
      :class="{ disabled: !canBuy }"
      :disabled="!canBuy"
      @click="buy"
    >
      <span class="multiplier-chip">
        {{ gameStore.buyMultiplier === 'max' ? $t('common.max') : gameStore.buyMultiplier }}
      </span>
      <span v-if="discountedCost" class="cost-stack">
        <s>{{ formattedCost }}</s>
        <b>{{ formatNumber(discountedCost) }}</b>
      </span>
      <b v-else>{{ formattedCost }}</b>
      <Icon name="mdi:cart-plus" />
    </button>
  </article>
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

const progressWidth = computed(() => {
  const progress = Number(progressInfo.value.progress);
  if (!Number.isFinite(progress)) return 0;
  return Math.min(100, Math.max(0, Number(progress.toFixed(4))));
});

const formattedProgress = computed(() => {
  const rounded = Number(progressWidth.value.toFixed(1));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
});

const localizedName = computed(() => getLocalizedGameName(config.value.name, locale.value));

const buy = () => {
  if (canBuy.value) {
    emit('buy');
  }
};
</script>

<style scoped>
.generator-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(82px, 24%, 108px);
  gap: 8px;
  overflow: hidden;
  border: 1px solid rgba(76, 165, 255, 0.26);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.98), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 0% 0%, rgba(76, 165, 255, 0.16), transparent 40%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset, inset 0 0 22px rgba(0, 0, 0, 0.22);
  padding: 9px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.generator-row.affordable {
  border-color: rgba(134, 239, 172, 0.42);
  box-shadow: 0 0 0 1px rgba(134, 239, 172, 0.08), 0 0 18px rgba(56, 153, 250, 0.12), inset 0 0 22px rgba(0, 0, 0, 0.2);
}

.generator-main {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 9px;
  min-width: 0;
}

.tier-badge {
  display: grid;
  place-items: center;
  align-self: stretch;
  border: 1px solid rgba(76, 165, 255, 0.3);
  border-radius: 8px;
  background: rgba(56, 153, 250, 0.16);
  color: #bae6fd;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.72rem;
  font-weight: 900;
}

.generator-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  gap: 9px;
}

.title-line {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.title-line h3 {
  flex: 1 1 5rem;
  min-width: 0;
  overflow: hidden;
  color: #f8fbff;
  font-size: 0.94rem;
  font-weight: 900;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-chip {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 3px;
  min-width: 0;
  max-width: 68%;
  border: 1px solid rgba(142, 173, 204, 0.28);
  border-radius: 999px;
  background: rgba(8, 15, 24, 0.66);
  color: #b9cde0;
  font-size: 0.64rem;
  font-weight: 800;
  line-height: 1.25;
  padding: 3px 6px;
  white-space: nowrap;
}

.amount-chip b,
.amount-chip i {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-style: normal;
  white-space: nowrap;
}

.amount-chip b {
  color: #ffffff;
}

.amount-chip i {
  color: #bbf7d0;
}

.bonus-strip {
  min-width: 0;
}

.bonus-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
  color: #b9cde0;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.72rem;
  font-weight: 800;
}

.bonus-meta span {
  color: #dcfce7;
}

.progress-track {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(8, 15, 24, 0.76);
  outline: 1px solid rgba(142, 173, 204, 0.18);
}

.progress-track div {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #4ca5ff, #9af7bd);
  box-shadow: 0 0 14px rgba(76, 165, 255, 0.42);
  transition: width 0.22s ease;
}

.buy-button {
  position: relative;
  display: grid;
  min-width: 0;
  place-items: center;
  align-content: center;
  gap: 2px;
  min-height: 58px;
  border: 1px solid rgba(76, 165, 255, 0.44);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(56, 153, 250, 0.34), rgba(28, 112, 190, 0.3));
  color: #ffffff;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.76rem;
  font-weight: 900;
  transition: border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
}

.buy-button:not(.disabled):hover {
  border-color: rgba(186, 230, 253, 0.72);
  background: linear-gradient(180deg, rgba(76, 165, 255, 0.45), rgba(28, 112, 190, 0.38));
  transform: translateY(-1px);
}

.buy-button.disabled {
  cursor: not-allowed;
  border-color: rgba(142, 173, 204, 0.22);
  background: rgba(15, 23, 42, 0.64);
  color: #8ba2b7;
}

.multiplier-chip {
  position: absolute;
  top: 4px;
  right: 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.34);
  color: #dbeafe;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.54rem;
  font-weight: 900;
  padding: 1px 4px;
}

.cost-stack {
  display: grid;
  gap: 1px;
  text-align: center;
}

.cost-stack s {
  color: #93a7ba;
  font-size: 0.62rem;
}

.cost-stack b {
  color: #bbf7d0;
}

.buy-button > .iconify {
  color: #dbeafe;
  font-size: 0.9rem;
}

@media (max-width: 380px) {
  .generator-row {
    grid-template-columns: minmax(0, 1fr) 76px;
    gap: 7px;
    padding: 8px;
  }

  .generator-main {
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 7px;
  }

  .amount-chip {
    padding-inline: 6px;
  }

  .buy-button {
    min-height: 56px;
    font-size: 0.7rem;
  }
}
</style>
