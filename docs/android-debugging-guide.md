# Android 调试指南 (Capacitor)

本文档提供了在 Android 设备（模拟器或真实设备）上调试集成了 Capacitor 的 Nuxt 应用的详细步骤。

## 核心调试方式

主要有两种调试方式，分别适用于不同场景：

1.  **实时重载 (Live Reload)**：
    *   **用途**：调试 UI 和 Web 逻辑 (HTML, CSS, TypeScript)。
    *   **优点**：最高效，代码改动能立即在 App 中生效，无需重新编译。这是 **95% 的开发时间里会使用**的方法。

2.  **Android Studio 原生调试**：
    *   **用途**：调试原生插件（如相机、GPS）或你自己编写的 Java/Kotlin 代码。
    *   **优点**：可以查看原生日志 (Logcat) 和使用断点进行单步调试。

---

## 方法一：使用实时重载调试 Web 代码 (推荐)

这个流程能让你像开发普通网站一样，在真实设备或模拟器上获得热重载体验。

### 准备工作

- **安装 Android Studio**：确保你已安装安卓开发的官方 IDE。
- **准备安卓设备**：
    - **模拟器**：在 Android Studio 的设备管理器中创建一个虚拟设备。
    - **真实设备**：通过 USB 连接手机，并**开启“开发者选项”和“USB 调试”**。

### 第 1 步：在局域网中启动 Nuxt 开发服务器

为了让你的手机能访问到电脑上的开发服务器，你需要：

1.  **找到你电脑的局域网 IP 地址**。
    *   **Linux / macOS**: 在终端运行 `ip addr` 或 `ifconfig`。
    *   **Windows**: 在命令提示符 (CMD) 中运行 `ipconfig`。
    *   记下这个 IP 地址，它通常看起来像 `192.168.1.XXX`。

2.  **启动 Nuxt 服务器**，并指定 `--host` 参数使其在局域网内可访问。

    ```bash
    pnpm dev --host
    ```

    启动后，请确保你可以通过 `http://<你的IP地址>:3000` 在**手机的浏览器**里成功访问到你的应用。

### 第 2 步：配置 Capacitor 指向开发服务器

修改项目根目录下的 `capacitor.config.json` 文件，添加一个 `server` 对象：

```json
{
  "appId": "com.codedeity.app",
  "appName": "Code Deity",
  "webDir": ".output/public",
  "server": {
    "url": "http://192.168.1.100:3000",
    "cleartext": true
  }
}
```

- **重要**：将 `192.168.1.100` 替换为你**自己电脑的真实 IP 地址**。
- `"cleartext": true` 是必需的，它允许 App 在开发时加载 `http` 协议的本地地址。

### 第 3 步：同步配置并打开 Android Studio

1.  运行同步命令，将新的 `capacitor.config.json` 配置更新到原生项目中。

    ```bash
    pnpm cap sync
    ```

2.  在 Android Studio 中打开你的安卓项目。

    ```bash
    pnpm cap open android
    ```

### 第 4 步：运行和调试

1.  在 Android Studio 的顶部工具栏中，从设备列表中选择你的模拟器或已连接的真实设备。
2.  点击绿色的 **"Run 'app'"** 按钮 (▶️)。
3.  App 启动后，它会加载你电脑上开发服务器的内容。现在，**你在 VS Code 中做的任何代码修改，都会实时反映在 App 中！**

### 第 5 步：使用 Chrome 开发者工具

你可以像调试网页一样调试 App 里的 WebView。

1.  在电脑上打开 Chrome 浏览器，访问 `chrome://inspect`。
2.  在 "Remote Target" 列表中，你应该能看到你的设备和 App (`com.codedeity.app`)。
3.  点击 **inspect**，就会弹出一个功能齐全的 Chrome 开发者工具窗口。你可以在这里：
    *   查看 `console.log` 输出。
    *   检查网络请求。
    *   调试 JavaScript，设置断点。
    *   审查和实时修改 DOM 元素与 CSS 样式。

---

## 方法二：使用 Android Studio 调试原生代码

当你需要调试原生插件或排查原生层面的问题时，使用此方法。

1.  **构建并同步**：确保你的 Web 代码已经构建。

    ```bash
    pnpm generate && pnpm cap sync
    ```

2.  **打开项目**：在 Android Studio 中打开项目。

    ```bash
    pnpm cap open android
    ```

3.  **使用 Logcat**：
    *   在 Android Studio 底部找到 **Logcat** 窗口。
    *   这是一个强大的工具，可以显示来自 App 和安卓系统的所有日志。
    *   你可以按关键词（比如 `Capacitor`）进行过滤，查看所有原生层的日志输出。

4.  **设置断点**：
    *   你可以在项目视图中找到并打开 Java 或 Kotlin 文件（通常在 `app/src/main/java/...` 目录下）。
    *   在代码行号旁边单击即可设置断点。
    *   使用顶部的 **"Debug 'app'"** 按钮 (🐞) 启动 App，当代码执行到断点时，程序会暂停，你就可以进行单步调试了。
