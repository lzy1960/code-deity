<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative w-full max-w-2xl h-[80vh] m-4 rounded-2xl bg-transparent p-0 shadow-2xl shadow-cyan-500/20 overflow-hidden border border-cyan-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] h-full overflow-hidden">
          <div class="p-6 h-full flex flex-col">
            <h2 class="mb-4 text-center text-2xl font-bold text-cyan-300 shrink-0">
              <Icon name="mdi:help-circle" class="mr-2" />
              帮助文档
            </h2>
            
            <div class="flex-1 overflow-y-auto pr-2 space-y-6 text-gray-300">
              <!-- Core Resources -->
              <div>
                <h3 class="text-lg font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-1">核心资源</h3>
                <div class="space-y-3">
                  <div class="help-item">
                    <dt class="font-bold text-white">算力 (CP)</dt>
                    <dd class="text-sm">游戏中最基础的资源，通过手动点击或生成器自动产生。</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isRefactorUnlocked" class="font-bold text-white">重构点 (RP)</dt>
                    <dd v-if="gameStore.isRefactorUnlocked" class="text-sm">通过“代码重构”获得的第一层级重置资源，用于提升“代码优雅度”。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isCompileUnlocked" class="font-bold text-white">版本号 (Version)</dt>
                    <dd v-if="gameStore.isCompileUnlocked" class="text-sm">通过“编译发布”获得的第二层级重置资源，用于增强 RP 的获取效率或效果。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">奇点算力 (SP)</dt>
                    <dd v-if="gameStore.unlockedSingularity" class="text-sm">通过“技术奇点”获得的、用于第二纪元“编程范式”技能树的新货币。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">创世碎片 (GS)</dt>
                    <dd class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                </div>
              </div>

              <!-- Core Mechanics -->
              <div>
                <h3 class="text-lg font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-1">核心机制与事件</h3>
                <div class="space-y-3">
                  <div class="help-item">
                    <dt class="font-bold text-white">生成器 (Generators)</dt>
                    <dd class="text-sm">游戏中自动化生产资源的核心单位，共分 8 阶。</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isRefactorUnlocked" class="font-bold text-white">代码重构 (Refactor)</dt>
                    <dd v-if="gameStore.isRefactorUnlocked" class="text-sm">第一层级的重置事件，消耗 CP 和生成器，以换取 RP。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isCompileUnlocked" class="font-bold text-white">编译发布 (Compile & Release)</dt>
                    <dd v-if="gameStore.isCompileUnlocked" class="text-sm">第二层级的重置事件，消耗 RP，以换取“版本号”。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isRefactorUnlocked" class="font-bold text-white">架构过载 (Architectural Overhead)</dt>
                    <dd v-if="gameStore.isRefactorUnlocked" class="text-sm">当拥有过多“AI 核心”时触发的软上限，会对总算力产出施加惩罚。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">技术奇点 (Singularity)</dt>
                    <dd v-if="gameStore.unlockedSingularity" class="text-sm">第一纪元的终极重置事件，重置进度以换取 SP，并开启第二纪元。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">化身创世 (Become Genesis)</dt>
                    <dd class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">技术债务 (Technical Debt)</dt>
                    <dd v-if="gameStore.unlockedSingularity" class="text-sm">用于撤销已学习技能点的系统，需要付出一定代价（CP）来“偿还”。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                </div>
              </div>

              <!-- Game Systems -->
              <div>
                <h3 class="text-lg font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-1">游戏系统</h3>
                <div class="space-y-3">
                  <div class="help-item">
                    <dt v-if="gameStore.isChallengesUnlocked" class="font-bold text-white">挑战 (Challenges)</dt>
                    <dd v-if="gameStore.isChallengesUnlocked" class="text-sm">在带有特殊限制的重置中完成目标，以获得强大的永久奖励。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isAutomationUnlocked" class="font-bold text-white">自动化 (Automation)</dt>
                    <dd v-if="gameStore.isAutomationUnlocked" class="text-sm">解锁后，允许设置自动购买生成器。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">编程范式 (Programming Paradigms)</dt>
                    <dd v-if="gameStore.unlockedSingularity" class="text-sm">第二纪元的核心系统，一个用 SP 购买永久性升级的技能树。</dd>
                    <dd v-else class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">系统补丁 (System Patches)</dt>
                    <dd class="text-sm text-gray-500 italic">？？？</dd>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 text-center shrink-0">
              <button
                class="rounded-lg bg-cyan-600 px-8 py-3 font-bold text-white shadow-lg shadow-cyan-600/30 transition-colors hover:bg-cyan-700"
                @click="modal.hide()"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useHelpModal } from '~/composables/useHelpModal'
import { useGameStore } from '~/store/game'

const modal = useHelpModal()
const gameStore = useGameStore()
</script>

<style scoped>
.modal-bounce-enter-active,
.modal-bounce-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-bounce-enter-from,
.modal-bounce-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.animated-border {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    transparent,
    rgba(34, 211, 238, 0.7), /* cyan-400 */
    transparent 35%
  );
  transform: translate(-50%, -50%);
  animation: rotate 5s cubic-bezier(0.65, -0.5, 0.25, 1.5) infinite;
  z-index: 0;
}

@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
    opacity: 0.7;
  }
}

.help-item {
  padding: 12px 16px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}
</style>