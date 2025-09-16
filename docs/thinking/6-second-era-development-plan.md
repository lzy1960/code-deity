# 第二纪元：架构师时代 - 开发方案

**目标:** 实现“技术奇点”重置功能，并开发全新的“编程范式”技能树系统，为玩家带来质变的、更具策略深度的游戏体验。

**核心步骤:**

1.  **数据结构与状态管理 (Store)**：在 Pinia store (`app/store/game.ts`) 中扩展新的状态，为第二纪元奠定数据基础。
2.  **核心逻辑实现 (Logic)**：实现“技术奇点”重置的核心算法、新资源“奇点算力 (SP)”的计算，以及“编程范式”技能的购买与效果应用逻辑。
3.  **UI 组件开发 (Component)**：根据设计图，创建 `Singularity` 页面和相关的 Vue 组件，用于展示和交互。
4.  **系统集成与导航 (Integration)**：将新功能无缝整合到现有游戏流程中，包括重置触发、页面导航和数据持久化。
5.  **测试与数值平衡 (Testing & Balancing)**：确保新功能的稳定性和游戏体验的合理性。

---

### **详细执行计划**

#### **第一步：数据结构与状态管理 (Store)**

修改 `app/store/game.ts` 文件，添加新的 state 属性来管理第二纪元的核心数据。

1.  **添加新 State:**
    *   `singularityPower`: `Decimal` 类型，用于存储新的核心资源“奇点算力 (SP)”。
    *   `unlockedSingularity`: `boolean` 类型，用于标记玩家是否已至少完成过一次“技术奇点”重置。
    *   `paradigms`: `Record<string, boolean>` 类型，一个字典/映射，用于存储玩家已购买的“编程范式”技能。

2.  **初始化 State:** 在 `initialState` 工厂函数中为这些新属性提供默认值。

#### **第二步：核心逻辑实现 (Logic)**

在 `app/store/game.ts` 的 `actions` 和 `getters` 中实现核心玩法逻辑。

1.  **创建“编程范式”配置文件:**
    *   在 `game/` 目录下创建一个新文件 `paradigms.configs.ts`。
    *   以数据驱动的方式定义整个技能树，包含 `id`, `name`, `description`, `cost`, `requires`, `effect` 等属性。

2.  **实现 `performSingularityReset` Action:**
    *   **前置条件检查:** 验证 `computingPower` 是否达到 `1e308`。
    *   **计算 SP 收益:** 设计并实现 SP 的获取公式。
    *   **执行重置:** 重置第一纪元的所有进度。
    *   **授予资源:** 增加 `singularityPower`。
    *   **解锁状态:** 设置 `unlockedSingularity` 为 `true`。
    *   **调用存档:** 自动保存游戏。

3.  **实现 `purchaseParadigm` Action:**
    *   接收 `paradigmId` 作为参数。
    *   **校验逻辑:** 检查 SP 是否足够、是否已购买、前置技能是否满足。
    *   **执行购买:** 扣除 SP，并更新 `paradigms` 状态。
    *   **调用存档:** 自动保存游戏。

4.  **在 Getters 中应用范式效果:**
    *   修改现有的 `getters` (如 `cps`, `refactorPointGain` 等)，根据已购买的 `paradigms` 应用加成效果。

#### **第三步：UI 组件开发 (Component)**

根据 `UI/singularity_page/screen.png` 构建前端界面。

1.  **创建页面文件:** `app/pages/singularity.vue`。
2.  **创建核心组件:** `app/components/game/SingularitySection.vue`，用于渲染技能树。
3.  **创建节点组件:** `ParadigmNode.vue` (或在 `SingularitySection` 中实现)，用于显示单个技能节点，并根据状态（可购买、已购买等）应用不同样式和交互。

#### **第四步：系统集成与导航 (Integration)**

将新系统融入到现有游戏中。

1.  **添加重置触发器:**
    *   在 `app/pages/index.vue` 中，当条件满足时，显示“技术奇点”按钮或入口。

2.  **添加页面导航:**
    *   修改 `app/components/layout/AppFooter.vue` (或 `AppHeader.vue`)，添加指向 `/singularity` 的导航链接，并使用 `v-if` 控制其可见性。

3.  **更新数据持久化:**
    *   修改 `services/saveManager.ts`，在存读档逻辑中加入对新 state 的支持，并处理好新旧存档的兼容性。

#### **第五步：测试与数值平衡 (Testing & Balancing)**

1.  **单元测试:**
    *   在 `app/store/game.test.ts` 中为新的核心 actions 编写单元测试。
2.  **手动测试:**
    *   完整测试从第一纪元到第二纪元的流程，包括功能、UI 和存档。
3.  **数值平衡:**
    *   根据测试反馈，调整 SP 获取速度、技能成本和效果强度。
