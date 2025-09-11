### **第三周开发方案：核心循环重构与体验优化**

**总目标：** 整合并优化游戏的核心循环与存档机制，使其完全自动化，并对第一层重置（代码重构）的体验进行打磨。

---

#### **任务 1：重构并集中化游戏主循环与存档逻辑**

**现状分析：**
目前 `store/game.ts` 定义了 `gameLoop`，但 `plugins/game.ts` 中也存在一个循环，并且还处理了 `loadGame` 的调用。同时 `app.vue` 也调用了 `startGameLoop`。这种多头管理的方式容易导致 bug 和性能问题。

**开发步骤：**

1.  **精简插件 (`plugins/game.ts`)：**
    *   **移除**插件中的 `gameLoop` 函数和 `setInterval` 调用。
    *   **移除**插件中的 `app:mounted` 钩子和自动加载逻辑。
    *   **保留**插件的核心职责：提供全局可用的 `$saveGame` 和 `$loadGame` 方法，使其成为与 `saveManager` 交互的唯一入口。

2.  **强化主入口 (`app.vue`)：**
    *   在 `onMounted`生命周期钩子中，**统一管理**所有循环和初始化操作。
    *   **实现自动加载：** 在 `onMounted` 中首先调用 `$loadGame()`。
    *   **实现游戏主循环：** 调用 `gameStore.startGameLoop()`，它内部使用 `setInterval` 以 **50ms** 的高频率执行 `gameLoop`，确保数值顺滑增长。
    *   **实现自动存档循环：** 新增一个 `setInterval`，每 **15 秒**调用一次 `$saveGame()`，实现对玩家无感的后台自动保存。

3.  **移除手动存档 UI (`components/layout/AppHeader.vue`)：**
    *   删除 "Save" 和 "Load" 按钮及其事件，完成 `production.md` 中“移除手动存档按钮”的要求。

**预期成果：** 游戏的核心逻辑（加载、循环、保存）被统一到 `app.vue` 中进行管理，插件各司其职，代码结构更清晰，符合文档规划。

---

#### **任务 2：验证并打磨“代码重构” (RP) 系统**

**现状分析：**
RP 的获取公式、重置逻辑和增益效果已在 `store/game.ts` 中实现，但 UI 交互和条件判断尚不完善。

**开发步骤：**

1.  **验证数值公式：**
    *   **确认** `store/game.ts` 中的 `refactorGain` getter 与 `元素设计.md` 文档中的公式 `floor( (CP.log10() / 308) ^ 1.5 )` 保持一致。
    *   **确认** `rpBonus` getter 的计算逻辑符合文档描述。

2.  **完善 UI 交互 (`pages/index.vue` & `components/game/RefactorSection.vue`)：**
    *   **传递禁用状态：** 从 `index.vue` 将 `gameStore.canRefactor` 这个 getter 的结果传递给 `RefactorSection` 组件。
    *   **实现按钮禁用：** 在 `RefactorSection` 组件中，根据传入的 `canRefactor` 状态，当条件不满足时（AI 核心不足 10 个），禁用“Refactor Code”按钮并提供灰化的视觉提示。

**预期成果：** RP 系统的功能闭环完成，交互体验更友好，能有效防止玩家在不满足条件时进行误操作。

---
