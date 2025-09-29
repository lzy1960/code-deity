## 代码狂潮 (Code Rush) 功能开发日志

### 1. 功能概述

“代码狂潮”功能旨在为游戏主页的“手动超频”机制引入一个爆发性收益和更强的玩家互动。它包括一个充能进度条、激活后的高额收益加成、持续时间等。

### 2. UI 样式调整过程

在开发过程中，对“代码狂潮”按钮的 UI 样式进行了多次迭代和调整，以达到最佳的视觉效果和用户体验。

#### 2.1 进度条斑马纹效果

*   **初始需求**: 激活时背景色变为偏紫色的水平平移动画的斑马纹效果。
*   **实现**: 使用 `linear-gradient` 结合 `background-size` 和 `background-position` 动画实现斑马纹效果。`code-rush-fill` 元素在 Code Rush 激活时应用 `code-rush-active-zebra` 类，并通过 `width` 属性展示进度。
*   **问题与解决**: 
    *   **“斑马纹不是完整的直线”**: 最初的 `linear-gradient` 角度为 `-45deg`，导致斜线在视觉上不够平滑。通过调整 `linear-gradient` 的颜色停止点（例如 `25%` 和 `25.1%`）并增加 `background-size`（例如 `80px 80px`），使得斜线更加清晰和连续，减少了“锯齿”感。
    *   **“动画速度需要再快些”**: 将 `zebra-stripe-move` 动画的持续时间从 `1s` 缩短到 `0.5s`，使动画更具动感。
    *   **“斑马纹需要有一定的角度”**: 最终将 `linear-gradient` 的角度设置为 `-45deg`，以保持斜线效果。

#### 2.2 边框颜色动画

*   **初始需求**: 给边框也加上颜色动画，希望是顺时针旋转的流光效果。
*   **尝试 1 (伪元素 + `conic-gradient` + `mask-composite`)**: 首次尝试使用 `::before` 伪元素结合 `conic-gradient` 和 `mask-composite: exclude` 来创建旋转边框。
    *   **问题**: 效果“断断续续的”，流光效果不明显。
    *   **分析**: `mask-composite` 结合 `padding` 和 `border-radius` 容易出现渲染问题，且 `conic-gradient` 的颜色停止点可能不够平滑。
*   **尝试 2 (伪元素 + `linear-gradient` + `background-position` + `transform: rotate`)**: 尝试使用 `linear-gradient` 动画 `background-position` 和 `transform: rotate`。
    *   **问题**: 效果不理想，未能实现预期的“流光”旋转感。
*   **尝试 3 (伪元素 + `conic-gradient` + `radial-gradient` mask)**: 重新回到 `conic-gradient`，但优化了颜色停止点，并使用 `radial-gradient` 作为 `mask`。
    *   **问题**: 效果仍然不理想，流光效果不明显。
*   **最终方案 (移除流光边框)**: 鉴于流光边框效果难以达到预期且存在渲染问题，最终决定移除边框的流光效果，只保留按钮本身的阴影和背景动画。

#### 2.3 按钮阴影效果

*   **需求**: 代码狂潮触发时，添加激情的抖动效果和阴影。
*   **实现**: 
    *   在 `code-rush-animated-border-wrapper` 上添加 `code-rush-active-shadow` 类，并在 CSS 中定义 `box-shadow` 样式。
    *   使用 `@keyframes pulseShadow` 动画使阴影产生脉动效果。
*   **问题与解决**: 
    *   **“没看到阴影”**: 发现 `code-rush-animated-border-wrapper` 上的 `overflow: hidden` 裁剪了 `box-shadow`。通过移除 `code-rush-animated-border-wrapper` 上的 `overflow: hidden`，并确保 `code-rush-button` 自身保留 `overflow: hidden`，解决了阴影被裁剪的问题。
    *   **“阴影可以小一点，阴影的动画速度快一些”**: 调整了 `box-shadow` 的扩散半径和模糊半径，并缩短了 `pulseShadow` 动画的持续时间，使阴影更小、动画更快。

### 3. 按钮文案修改

*   **代码狂潮激活时**: 文案从“代码狂潮激活中 (剩余时间)”改为“代码狂潮激活中 (100倍收益)”。
*   **手动超频充能时**: 文案从“手动超频 (进度百分比)”改为“手动超频 (CPS * 5%)”。
*   **实现**: 修改 `codeRushButtonText` computed 属性的逻辑，并添加相应的 i18n 键值。

### 4. 最终效果描述

“代码狂潮”功能现在具有以下视觉和交互特性：

*   **充能进度条**: 按钮背景通过渐变颜色展示充能进度，充满时变为紫色渐变。
*   **激活状态**: 
    *   按钮背景显示偏紫色的水平平移动画斑马纹效果。
    *   按钮周围有脉动的紫色发光阴影。
    *   按钮文本显示“代码狂潮激活中 (100倍收益)”。
*   **手动超频**: 按钮文本显示“手动超频 (CPS * 5%)”。

### 5. 结论

“代码狂潮”功能已按需求实现，并通过多次 UI 样式调整，达到了预期的视觉和交互效果。在实现过程中，针对 CSS 动画的细节问题进行了反复尝试和优化，最终确定了兼顾性能和视觉表现的方案。