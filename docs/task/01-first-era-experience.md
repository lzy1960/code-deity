# 任务：完善第一纪元的核心体验 (Priority: Highest)

- [x] **实现叙事系统 (“创世日志”)**
    - **现状：** ~~这是设计文档中的核心亮点，但目前代码中完全缺失。~~ **已完成。**
    - **任务：** ~~创建一个事件系统，用于监听游戏状态变化，并根据预设条件触发相应的叙事内容。~~ **已在 `game.ts` 中集成 `checkNarrativeMilestones` action，并创建了 `NarrativeManager.vue` UI组件。**

- [ ] **UI/UX 的全面实现与打磨**
    - **现状：** `upgrades` 页面的主要组件样式已初步对齐设计稿。主页 `Generators` 列表和 `Settings` 页面尚未优化。
    - **已完成:**
        - [x] 创建 `pages/upgrades.vue` 页面并实现标签页布局。
        - [x] 重构 `ChallengesSection` 和 `ChallengeItem` 组件样式。
        - [x] 重构 `RefactorSection` 和 `CompileSection` 组件样式。
    - **待办任务：**
        - [ ] **主页生成器列表:** 对齐 `UI/generator_page/screen.png` 的设计。
        - [ ] **统计页面 (`StatsSection.vue`)：** 为其创建独立的页面或入口，并优化UI。
        - [ ] **设置页面 (`pages/settings.vue`):** 对齐 `UI/settings_page/screen.png` 的设计。

- [ ] **数值平衡性测试与调整**
    - **现状：** `game/configs.ts` 中定义了初始数值。已添加开发调试菜单。
    - **任务：** 进行完整的游戏流程测试（Playtesting），根据实际体验调整生成器成本、重构收益、挑战难度等，确保“慢节奏”和“撞墙感”恰到好处，避免玩家过早流失或后期数值膨胀。
