# 任务：技术与基础设施 (Priority: Medium)

- [x] **添加开发者调试菜单**
    - **现状:** ~~无~~ **已完成。**
    - **任务:** ~~创建一个悬浮菜单，用于直接修改CP、RP等核心数值，方便测试。~~ **已创建 `DebugMenu.vue` 组件，并添加 `_dev_` actions 到 `game.ts`。**

- [ ] **实现基于 Supabase 的后端服务**
    - **现状：** `GEMINI.md` 规划了使用 Supabase，但目前的游戏状态管理 (`game.ts`) 和存档 (`saveManager.ts`) 似乎仍是纯前端的本地存储。
    - **任务：**
        - [ ] **用户认证：** 集成 Supabase Auth，实现 Google 第三方登录。
        - [ ] **云端存档：** 将 `saveManager.ts` 的功能扩展，支持将游戏存档同步到 Supabase 数据库，实现跨设备游戏。

- [x] **补充单元测试 (Unit Tests)**
    - **现状：** ~~`GEMINI.md` 中明确要求，但项目中尚未发现 `*.test.ts` 文件。~~ **已完成。**
    - **任务：** ~~使用 Vitest 为 `app/store/game.ts` 中的核心数值计算编写单元测试，确保其准确无误，并为未来的重构和迭代提供安全保障。~~ **已为 `refactorGain`, `rpBonus`, `getBuyBonus`, `costForAmount` 添加了单元测试。**
    - **计划与测试点：**
        - **[x] 1. 环境搭建:**
            - 创建 `app/store/game.test.ts` 文件。
            - 确保 `vitest` 和 `pinia` 的测试环境能正常协作。
        - **[x] 2. `refactorGain` (重构收益) 测试:**
            - CP < 1e20 时，收益应为 0。
            - CP = 1e20 时，收益应为 1。
            - CP = 1e40 时，收益应为 floor(2^1.5) = 2。
        - **[x] 3. `rpBonus` (代码优雅度加成) 测试:**
            - 初始状态 (0 RP, 0 Version)，加成应为 1 (即无加成)。
            - 100 RP, 0 Version 时，加成应为 1 + (100 * 0.1) * (1 + 0) = 11。
            - 100 RP, 2 Version 时，加成应为 1 + (100 * 0.1) * (1 + 2 * 0.2) = 15。
        - **[x] 4. `buy10Bonus` (购买奖励) 测试:**
            - 测试不同购买数量下的奖励等级是否正确。
        - **[x] 5. `costForAmount` (成本计算) 测试:**
            - 测试购买 1 个、10 个和 Max 时的成本计算是否精确。
