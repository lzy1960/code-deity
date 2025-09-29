<h1 align="center">Code Deity - 代码神祇</h1>

<p align="center"><img src="./public/theme-logo.png" alt="Code Deity Logo" width="200"></p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Nuxt-4.x-green.svg" alt="Nuxt">
  <img src="https://img.shields.io/badge/Vue-3.x-brightgreen.svg" alt="Vue">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg" alt="TypeScript">
</p>

<p align="center">
  一款以编程和科技演化为主题的，慢节奏、高深度的文字放置游戏。
</p>

<p align="center">
  <a href="https://code-deity.stormlee.asia/" target="_blank">立即体验 Code Deity，开启你的数字创世之旅！</a>
</p>

<p align="center"> 如果你喜欢这个项目，请给它一个 ⭐ 吧！</p>

---

## 🌌 产品愿景 (Product Vision)

Code Deity 是一款独特的放置游戏，玩家将从零开始，通过“写代码”积累“算力”，逐步解锁编程概念，最终演化为掌控数字宇宙的“神祇”。游戏旨在提供一种“园艺”般的长期满足感，每一次突破都是值得庆祝的里程碑，献给热爱编程、享受思考与策略的玩家。

## ✨ 核心特性 (Core Features)

- **主题驱动机制:** 所有游戏元素均与编程/科技主题深度绑定。
- **渐进式系统解锁:** 界面初始极简，新系统和功能随进程逐步解锁。
- **多层级重置循环:**
  - **代码重构 (Refactor):** 获取“重构点”，提升算力产出。
  - **编译发布 (Compile & Release):** 获取“版本号”，提升“重构点”效率。
  - **技术奇点 (Singularity):** 达成纪元目标，解锁“编程范式”技能树。
- **沉浸式叙事:** 通过“创世日志”和“创世事件”提供电影级叙事体验。
- **移动端支持:** 基于 Capacitor 提供安卓和 iOS 原生体验。

## 💻 技术栈 (Tech Stack)

- **客户端 (Client-Side):**
  - **框架:** [Nuxt 4](https://nuxt.com/)
  - **语言:** [TypeScript](https://www.typescriptlang.org/)
  - **状态管理:** [Pinia](https://pinia.vuejs.org/)
  - **核心数值处理:** [break_infinity.js](https://github.com/Patashu/break_infinity.js)
  - **本地存储:** [Dexie.js](https://dexie.org/) (对 IndexedDB 的封装)
  - **原生打包:** [Capacitor](https://capacitorjs.com/)

## 🚀 本地开发 (Getting Started)

欢迎贡献者！请遵循以下步骤在本地运行项目：

1.  **克隆仓库:**

    ```bash
    git clone https://github.com/your-username/code-deity.git
    cd code-deity
    ```

2.  **安装依赖 (推荐使用 pnpm):**

    ```bash
    pnpm install
    ```

3.  **启动开发服务器:**

    ```bash
    pnpm dev
    ```

    项目将在 `http://localhost:3000` 运行。

4.  **移动端开发（搁置）**
    请参考 `docs/android-debugging-guide.md` 进行原生应用调试。

> [!TIP]
> 更详细的开发理念和设计文档，请参阅 [GEMINI.md](GEMINI.md)。

## 📜 开源许可 (License)

本项目采用 [MIT License](LICENSE) 开源许可。
