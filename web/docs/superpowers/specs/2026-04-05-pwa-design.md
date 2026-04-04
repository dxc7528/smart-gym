# PWA 改造设计

## 目标

将 Smart Gym Web 应用转化为 Progressive Web App（PWA），支持"添加到主屏幕"和完全离线运行。

## 架构概述

通过 `vite-plugin-pwa`（底层 Workbox）自动生成 Service Worker + Web App Manifest。

---

## 改动范围（4 个文件）

| 文件 | 改动内容 |
|------|---------|
| `vite.config.js` | 接入 VitePWA 插件，声明 Manifest + Workbox 缓存策略 |
| `src/main.jsx` | 挂载 `<PwaUpdater />` 组件 |
| `src/components/PwaUpdater.jsx` | 新建，响应 `offlineReady` / `needRefresh` 状态 |
| `public/` | 需新增 PWA 图标（192×192、512×512） |

---

## Service Worker 缓存策略

采用统一的 `CacheFirst` 策略（完全离线目标）：

- **静态资源**（HTML/JS/CSS/图片/SVG）：首次请求缓存，后续直接取缓存，离线可用
- **无 API 缓存**：应用为纯本地数据，无远程 API

---

## 版本更新机制

使用 `registerType: 'prompt'`，配合 PwaUpdater 组件：

- 新版 SW 后台下载完成后 → 页面顶部出现 Toast "有新内容可用，请刷新更新" + **刷新**按钮
- 用户点击刷新 → SW 发送 `SKIP_WAITING` 信号 → 立即激活新版本并刷新页面
- 不打断用户当前操作，用户主动控制更新时机

同时保留 `offlineReady` 反馈：首次完全可离线时显示一次"已准备好离线使用"提示（自动消失）。

---

## 无 Offline/Online 监听

不引入 App.jsx 的 `offline` / `online` 监听逻辑。PWA 本身已通过缓存保障离线可用，无需额外网络状态 UI。

---

## 安装体验

使用浏览器默认提示，不拦截 `beforeinstallprompt` 事件。
