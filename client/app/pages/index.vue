<template>
  <div class="relative flex size-full min-h-screen flex-col text-white dark group/design-root" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>
    <AppHeader :currency="gameStore.currency.toNumber()" @saveGame="$saveGame" @loadGame="$loadGame" />

    <main class="flex-grow p-4 space-y-6">
      <div>
        <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Generators</h2>
        <div class="space-y-3">
          <GeneratorItem
            v-for="generator in gameStore.generators"
            :key="generator.id"
            :generator="generator"
            @buy="gameStore.buyGenerator(generator.id)"
          />
        </div>
      </div>

      <div>
        <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Code Refactoring (RP)</h2>
        <RefactorSection :potential-rp-gain="gameStore.rpGain.toNumber()" @refactor="gameStore.refactorCode" />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import AppHeader from '~/components/layout/AppHeader.vue';
import GeneratorItem from '~/components/game/GeneratorItem.vue';
import RefactorSection from '~/components/game/RefactorSection.vue';
import AppFooter from '~/components/layout/AppFooter.vue';

const gameStore = useGameStore();
// 从 Nuxt 插件中获取 provide 的方法
const { $saveGame, $loadGame } = useNuxtApp();
</script>
