# 产品开发任务拆解清单：文字放置游戏《代码神祇》(The Code Deity) - 修订版

# 阶段：MVP (P0 & P1)

# 版本：1.0 (基于 Nuxt 3/4, Pinia, Dexie.js, break_infinity.js)

---

==================================================
第一周：P0 - 架构奠基与技术验证
==================================================
目标: 搭建一个遵循最终架构原则的、可运行、可持久化的最小原型。

## 任务 1.1: 项目初始化与配置

- 动作: 运行 `nuxi init code-deity`。
- 动作: 安装 MVP 阶段的所有核心依赖：`pnpm install @pinia/nuxt break_infinity.js dexie`。
- 动作: 在 `nuxt.config.ts` 中配置 Pinia 模块，并将 CSS 预处理器设置为 Less。
- 产出: 一个配置了 TypeScript, Pinia 和 Less 的 Nuxt 4 项目骨架。

## 任务 1.2: 构建版本化的状态模型 (无变更)

- **动作**: 创建 `store/game.ts`。
- **动作**: 定义核心 state，并立刻引入 `saveVersion` 字段，如 `saveVersion: '1.0.0'`。这为“版本化存档”奠定基础。
- **动作**: 定义一个最小化的生成器数组（先放 1-2 个），所有数值（成本、产量等）必须使用 `new Decimal()` 初始化。
- **产出**: 一个可扩展且为未来存档迁移做好准备的 Pinia Store。

## 任务 1.3: 实现带反作弊考量的游戏循环 (无变更)

- **动作**: 在 `app.vue` 中创建 `gameLoop` 函数，由 `setInterval` 驱动。
- **动作**: 实现 Tier 1 反时间欺骗:
  - 在 `gameLoop` 中，计算 `diff = (Date.now() - lastUpdateTime) / 1000`。
  - 设置一个上限，例如 `const effectiveDiff = Math.min(diff, 3600)`，这意味着离线收益最多计算 1 小时。
  - 基于 `effectiveDiff` 来计算资源增长。
- **产出**: 一个能安全计算在线和离线收益的核心游戏循环。

## 任务 1.4: 实现配置驱动的购买逻辑 (无变更)

- **动作**: 创建一个 `game/configs.ts` 文件。将生成器的 `baseCost`, `costMultiplier` 等所有“魔法数字”移到这个文件中。
- **动作**: 在 UI 上添加一个生成器的购买按钮，其逻辑从 `configs.ts` 读取数值。
- **产出**: 游戏数值与游戏逻辑分离，为后续平衡性调整提供了便利。

## 任务 1.5: 验证基于 Dexie.js 的模块化存档服务 (已修正)

- **背景**: 原计划未指定持久化方案。Dexie.js 是一个强大的 IndexedDB 包装器，非常适合此场景。`Decimal` 对象不能被直接 `JSON.stringify`。
- **动作 1**: 创建 `utils/db.ts` 文件来初始化并导出 Dexie 实例。
  ```typescript
  // utils/db.ts
  import Dexie, { type Table } from 'dexie';

  export interface GameSave {
    id?: number;
    saveData: string; // Storing the stringified JSON
    timestamp: number;
  }

  export class MySubClassedDexie extends Dexie {
    saves!: Table<GameSave>;

    constructor() {
      super('CodeDeityDB');
      this.version(1).stores({
        saves: '++id, timestamp', // Primary key and indexed timestamp
      });
    }
  }

  export const db = new MySubClassedDexie();
  ```
- **动作 2**: 创建 `services/saveManager.ts`。
- **动作 3**: 在 `saveManager.ts` 中实现 `save(state)` 函数。
  - 此函数接收 Pinia 的 state 对象。
  - **关键步骤**: 在序列化之前，需要一个辅助函数将 `Decimal` 对象转换为可存储的字符串。检查 `break_infinity.js` 是否提供 `.toString()` 或 `.toJSON()` 方法。如果 `state` 包含 `Decimal` 实例，`JSON.stringify` 会产生不完整的结果。正确的做法是先遍历 state，将所有 `Decimal` 实例转换为字符串表示。
  - 调用 `db.saves.put({ id: 1, saveData: JSON.stringify(serializableState), timestamp: Date.now() })` 将其存入数据库（使用固定 ID `1` 来覆盖存档）。
- **动作 4**: 在 `saveManager.ts` 中实现 `load()` 函数。
  - 调用 `db.saves.get(1)` 来获取存档。
  - **关键步骤**: 如果获取到存档，解析 `saveData` JSON 字符串，并使用一个辅助函数将字符串反序列化回 `new Decimal()` 对象，然后再更新 Pinia store。
- **动作 5**: 添加手动的“保存”和“加载”按钮进行测试，确保刷新后数据可恢复。
- **产出**: 一个独立的、可测试的、基于 Dexie.js 的本地存档模块，并解决了大数序列化问题。

---
*(后续周的任务基本依赖于第一周的架构，因此保持不变，但它们的实现将受益于第一周更扎实的基础)*
---

==================================================
第二周：P1 - 核心玩法系统构建
==================================================
目标: 将原型扩展为具备 8 阶生成器和完整购买/生产循环的系统。

## 任务 2.1: 构建完整的生成器系统

- 动作: 在 `game/configs.ts` 中，定义全部 8 阶生成器的数据。
- 动作: 在 `store/game.ts` 中，根据配置文件初始化这 8 个生成器的 state。
- 产出: 游戏的核心数据层准备就绪。

## 任务 2.2: 创建可复用的 UI 组件

- 动作: 创建 `components/GeneratorRow.vue` 组件，用于显示单个生成器的所有信息。
- 动作: 在主页面使用 `v-for` 循环渲染所有生成器，并传递相应的 props 和事件。
- 产出: 一个数据驱动、可维护的主游戏界面。

## 任务 2.3: 实现通用的购买与显示逻辑

- 动作: 在 Pinia store 中创建 `buyGenerator(id)` action，使其能处理对任意生成器的购买请求。
- 动作: 创建 `utils/format.ts` 工具函数，用于将 `Decimal` 数字格式化为 `1.23e15` 或 `K, M, B, T` 等易读格式。
- 动作: 在所有 UI 界面应用此格式化函数。
- 产出: 玩家可以购买所有生成器，并且界面能清晰地展示天文数字。

==================================================
第三周：P1 - 引入第一层深度与体验优化
==================================================
目标: 完成“代码重构”(RP)系统，并自动化存档，提升游戏体验。

## 任务 3.1: 实现“代码重构”(RP)的计算与展示

- 动作: 在 state 中添加 `refactorPoints`。
- 动作: 创建一个 Pinia Getter `rpGainPreview`，根据公式实时计算当前重构可获得的 RP，并在 UI 上醒目地展示出来。
- 产出: 玩家获得清晰的重置目标，增加了游戏粘性。

## 任务 3.2: 实现 RP 的重置与增益闭环

- 动作: 创建 `performRefactor()` action，实现“获取 RP -> 重置进度”的逻辑。
- 动作: 修改 `gameLoop` 中的生产力计算公式，将 RP 带来的增益效果应用进去。
- 产出: 游戏的核心玩法形成第一个完整的正反馈闭环。

## 任务 3.3: 实现自动化存档 (实现细节明确)

- 动作: 移除手动的存档按钮。
- 动作: 在 `app.vue` 中，`onMounted` 时自动调用 `saveManager.load()`。
- 动作: 使用 `setInterval` 每 15 秒自动调用一次 `saveManager.save(gameState)`。
- 产出: 一个对玩家无感的、可靠的自动存档系统。

==================================================
第四周：P1 - 引入第二层深度并完成 MVP
==================================================
目标: 完成所有 MVP 规划的功能，并进行最终的数值平衡。

## 任务 4.1: 实现“编译发布”(VP)元重置系统

- 动作: 参照 RP 系统的实现步骤，快速实现 VP 系统的 state、预览、执行和增益逻辑。确保它能正确重置 RP。
- 产出: 游戏具备了更长期的目标和更深度的策略。

## 任务 4.2: 实现自动化购买升级

- 动作: 在 state 中添加 `upgrades` 对象来管理自动化购买器的解锁状态。
- 动作: 在 UI 中创建一个升级面板，允许玩家消耗 RP 或 VP 来解锁这些自动化功能。
- 动作: 在 `gameLoop` 中集成自动化购买逻辑。
- 产出: 游戏后期的重复性操作被消除，体验得到优化。

## 任务 4.3: 全面的数值平衡与测试

- 动作: 作为设计师和玩家，从头到尾完整地玩一遍游戏。
- 动作: 检查游戏节奏，是否存在“卡点”或“数值膨胀过快”的阶段。
- 动作: 只修改 `game/configs.ts` 文件中的数值来进行平衡性调整。
- 产出: 一个数值曲线平滑、可玩性强的 MVP 版本。

## 任务 4.4: 部署 MVP Web 版本

- 动作: 运行 `pnpm run generate` 生成静态网站。
- 动作: 将生成的 `dist/` 目录部署到任何静态托管平台（如 Vercel, Netlify, GitHub Pages）。
- 产出: 一个公开可访问的 URL，你可以将它分享给朋友或早期测试者，以收集关于核心玩法的宝贵反馈。

---

# UI 设计图说明

UI 设计图的文字描述和对应的 HTML 代码位于 `UI/` 文件夹中。开发界面时可以参考其中的 HTML 代码复刻页面。
