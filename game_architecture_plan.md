# 游戏架构设计与重构计划

## 概述

本计划旨在根据用户提供的游戏流程，对现有项目进行全面的架构设计和重构。游戏将划分为三个主要纪元，每个纪元拥有独特的资源、生成器和系统。我们将采用模块化设计和 Pinia 状态管理，确保项目的可维护性和可扩展性。

## 核心技术栈

*   **前端框架**: Nuxt.js (Vue 3)
*   **状态管理**: Pinia
*   **大数字处理**: decimal.js
*   **数据持久化**: Dexie.js (IndexedDB)

## 高层次架构设计

```mermaid
graph TD
    A[用户界面 (app.vue)] --> B{当前纪元?}
    B -- 第一纪元: 程序员 --> C[ProgrammerEra.vue]
    B -- 第二纪元: 架构师 --> D[ArchitectEra.vue]
    B -- 第三纪元: 神祇 --> E[DeityEra.vue]

    subgraph Pinia Stores
        P1[playerStore]
        P2[generatorsStore]
        P3[refactorStore]
        P4[compileStore]
        P5[automationStore]
        P6[challengesStore]
        P7[paradigmStore]
        P8[patchesStore]
    end

    subgraph Services & Utilities
        S1[gameLoop.ts]
        S2[gameConfig.ts]
        S3[save.ts]
    end

    C --> C1[GeneratorList.vue]
    C --> C2[RefactorTab.vue]
    C --> C3[CompileTab.vue]
    C --> C4[AutomationSettings.vue]
    C --> C5[ChallengesList.vue]

    D --> D1[ParadigmTree.vue]

    E --> E1[SystemPatches.vue]

    C1 -- 交互 --> P2
    C2 -- 交互 --> P1, P3
    C3 -- 交互 --> P1, P4
    C4 -- 交互 --> P5
    C5 -- 交互 --> P6
    D1 -- 交互 --> P1, P7
    E1 -- 交互 --> P1, P8

    S1 -- 更新 --> P1, P2, P3, P4, P5, P6, P7, P8
    S2 -- 配置 --> P2, P3, P4, P5, P6, P7, P8
    S3 -- 持久化 --> P1, P2, P3, P4, P5, P6, P7, P8

    P1 -- 状态 --> C, C1, C2, C3, C4, C5, D1, E1
    P2 -- 状态 --> C1
    P3 -- 状态 --> C2
    P4 -- 状态 --> C3
    P5 -- 状态 --> C4
    P6 -- 状态 --> C5
    P7 -- 状态 --> D1
    P8 -- 状态 --> E1
```

## 详细计划

1.  **更新 `package.json`**: 确保所有必要的依赖（如 `decimal.js`, `dexie`, `pinia`）都已安装。
2.  **重构 `gameConfig.ts`**:
    *   定义所有纪元的生成器（Variable 到 A.I. Core）。
    *   添加重置（Refactor, Compile, Singularity, Genesis）的成本、奖励和解锁条件。
    *   添加自动化、挑战、编程范式、系统补丁的配置。
3.  **更新 `game/types/` 目录**:
    *   创建新的类型定义，如 `IPlayerState` (包含所有资源和纪元状态), `IGenerator` (包含 `era` 字段), `IRefactorState`, `ICompileState`, `IAutomationState`, `IChallenge`, `IParadigmUpgrade`, `ISystemPatch` 等。
    *   更新 `SaveData` 接口以包含所有新的 Store 状态。
4.  **创建新的 Pinia Stores**:
    *   `game/state/refactorStore.ts`
    *   `game/state/compileStore.ts`
    *   `game/state/automationStore.ts`
    *   `game/state/challengesStore.ts`
    *   `game/state/paradigmStore.ts`
    *   `game/state/patchesStore.ts`
    *   更新 `game/state/playerStore.ts` 以包含新的资源 (SP, GS) 和纪元状态。
    *   更新 `game/state/generatorsStore.ts` 以支持多纪元生成器。
5.  **重构 `game/systems/` 目录**:
    *   `game/systems/generator.ts`：更新购买逻辑以适应新的生成器定义和纪元。
    *   创建新的系统服务，如 `RefactorService`, `CompileService`, `AutomationService`, `ChallengeService`, `ParadigmService`, `PatchService`，封装各自的业务逻辑。
6.  **更新 `game/services/gameLoop.ts`**:
    *   修改游戏循环，使其能够根据当前纪元和解锁的系统，调用相应的 Store 和 Service 进行更新。
    *   实现重置逻辑的触发和处理。
7.  **重构 `lib/save.ts`**:
    *   更新 `saveGame` 和 `loadGame` 函数，以保存和加载所有新的 Pinia Store 状态。
8.  **重构 Vue 组件**:
    *   `app/app.vue`：作为主入口，根据 `playerStore.currentEra` 动态渲染不同纪元的主界面组件。
    *   创建 `components/era/ProgrammerEra.vue`, `components/era/ArchitectEra.vue`, `components/era/DeityEra.vue`。
    *   更新 `components/generators/GeneratorList.vue` 以显示当前纪元的生成器。
    *   更新 `components/refactor/RefactorTab.vue`, `components/compile/CompileTab.vue`, `components/settings/SettingsTab.vue` 以适应新的游戏逻辑。
    *   创建 `components/automation/AutomationSettings.vue`, `components/challenges/ChallengesList.vue`, `components/paradigm/ParadigmTree.vue`, `components/patches/SystemPatches.vue`。
    *   确保所有 UI 元素都与 Pinia Store 中的状态正确绑定。
9.  **测试**:
    *   为每个新的 Store 和 Service 编写单元测试。
    *   进行端到端测试，确保游戏流程、重置机制和新系统按预期工作。
