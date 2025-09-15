# 任务：完善第一纪元的核心体验 (Priority: Highest)

- [x] **实现叙事系统 (“创世日志”):** 功能已完成。UI 组件 `NarrativeManager.vue` 实现了打字机、动态图标和扫描线等视觉效果。

- [x] **实现离线进度 (Offline Progress):** 功能已完成。在 `app.vue` 中集成了完整的离线收益处理逻辑。

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

- [ ] **数值平衡性测试与调整 (暂时搁置)**
    - **现状：** 已完成首次重构流程的理论推演，并根据结果实装了新的“全局生产力加成”平衡机制。
    - **已完成:**
        - [x] 完成首次重构流程的理论推演与分析。
        - [x] 根据分析结果，废弃了旧的平衡方案，并实装了新的“全局生产力加成”机制。
    - **待办任务:**
        - [ ] 需要进行实际游戏测试，以验证新机制下的游戏节奏。