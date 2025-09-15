# 任务：技术与基础设施 (Priority: Medium)

- [x] **添加开发者调试菜单**
    - **现状:** ~~无~~ **已完成。**
    - **任务:** ~~创建一个悬浮菜单，用于直接修改CP、RP等核心数值，方便测试。~~ **已创建 `DebugMenu.vue` 组件，并添加 `_dev_` actions 到 `game.ts`。**

- [ ] **实现基于 Supabase 的后端服务**
    - **现状：** `GEMINI.md` 规划了使用 Supabase，但目前的游戏状态管理 (`game.ts`) 和存档 (`saveManager.ts`) 似乎仍是纯前端的本地存储。
    - **任务：**
        - [ ] **用户认证：** 集成 Supabase Auth，实现 Google 第三方登录。
        - [ ] **云端存档：** 将 `saveManager.ts` 的功能扩展，支持将游戏存档同步到 Supabase 数据库，实现跨设备游戏。

- [ ] **补充单元测试 (Unit Tests)**
    - **现状：** `GEMINI.md` 中明确要求，但项目中尚未发现 `*.test.ts` 文件。
    - **任务：** 使用 Vitest 为 `app/store/game.ts` 中的核心数值计算（如重构收益、成本计算、购买奖励等复杂 Getter）编写单元测试，确保其准确无误，并为未来的重构和迭代提供安全保障。
