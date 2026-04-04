# PWA Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Smart Gym web app into a fully offline-capable PWA with installability and silent-auto-update via prompt flow.

**Architecture:** `vite-plugin-pwa` generates the Service Worker (Workbox) and Web App Manifest. All static assets use CacheFirst strategy. The `PwaUpdater` React component handles the SW update prompt lifecycle.

**Tech Stack:** `vite-plugin-pwa`, Workbox (via plugin), React

---

## File Structure

```
vite.config.js          — modified: add VitePWA plugin
src/main.jsx             — modified: mount <PwaUpdater />
src/components/
  PwaUpdater.jsx         — new: SW update prompt + offline ready toast
public/
  pwa-192x192.png        — new: 192×192 PWA icon
  pwa-512x512.png        — new: 512×512 PWA icon
```

---

## Task 1: Install vite-plugin-pwa

- Modify: `package.json` (add devDependency)

- [ ] **Step 1: Install dependency**

Run: `npm install -D vite-plugin-pwa`
Expected: Package added to devDependencies, `package-lock.json` updated

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add vite-plugin-pwa"
```

---

## Task 2: Configure VitePWA in vite.config.js

- Modify: `vite.config.js`

- [ ] **Step 1: Write updated vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Smart Gym — 训练计划管理',
        short_name: 'Smart Gym',
        description: '管理你的训练计划，浏览器内 AI 语音引导训练，完全离线运行',
        theme_color: '#F97316',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    port: 5173,
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add vite.config.js
git commit -m "feat: configure VitePWA with manifest and CacheFirst strategy"
```

---

## Task 3: Create PwaUpdater component

- Create: `src/components/PwaUpdater.jsx`

- [ ] **Step 1: Write PwaUpdater component**

```jsx
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  if (offlineReady) {
    setTimeout(() => setOfflineReady(false), 3000)
    return (
      <div className="pwa-toast pwa-toast--ready">
        <span>已准备好离线使用</span>
      </div>
    )
  }

  if (needRefresh) {
    return (
      <div className="pwa-toast pwa-toast--update">
        <span>有新内容可用，请刷新更新。</span>
        <button onClick={() => updateServiceWorker(true)}>刷新</button>
      </div>
    )
  }

  return null
}
```

- [ ] **Step 2: Add minimal toast styles (append to src/index.css)**

```css
.pwa-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.pwa-toast--ready {
  background: #22C55E;
  color: white;
}

.pwa-toast--update {
  background: #F97316;
  color: white;
}

.pwa-toast--update button {
  background: white;
  color: #F97316;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PwaUpdater.jsx src/index.css
git commit -m "feat: add PwaUpdater component for SW update prompts"
```

---

## Task 4: Mount PwaUpdater in main.jsx

- Modify: `src/main.jsx`

- [ ] **Step 1: Write updated main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import PwaUpdater from './components/PwaUpdater.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <PwaUpdater />
  </React.StrictMode>
)
```

- [ ] **Step 2: Commit**

```bash
git add src/main.jsx
git commit -m "feat: mount PwaUpdater in app root"
```

---

## Task 5: Generate PWA icons

Since the app's favicon is an SVG, generate PNG icons using a Node canvas approach.

- Create: `public/pwa-192x192.png`, `public/pwa-512x512.png`

- [ ] **Step 1: Install canvas for Node**

Run: `npm install -D @napi-rs/canvas`
Expected: Package added to devDependencies

- [ ] **Step 2: Create icon generation script**

Create: `scripts/generate-pwa-icons.mjs`

```javascript
import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync } from 'fs'

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Scale factor for retina clarity
  const scale = size / 32

  // Background rounded rect
  ctx.fillStyle = '#F97316'
  roundRect(ctx, 0, 0, size, size, 6 * scale)
  ctx.fill()

  // Dumbbell left plate
  ctx.fillStyle = 'white'
  roundRect(ctx, 4 * scale, 10 * scale, 6 * scale, 12 * scale, 2 * scale)
  ctx.fill()

  // Dumbbell bar
  ctx.fillStyle = 'white'
  roundRect(ctx, 10 * scale, 14 * scale, 12 * scale, 4 * scale, 1 * scale)
  ctx.fill()

  // Dumbbell right plate
  ctx.fillStyle = 'white'
  roundRect(ctx, 22 * scale, 10 * scale, 6 * scale, 12 * scale, 2 * scale)
  ctx.fill()

  // Lightning bolt
  ctx.fillStyle = '#22C55E'
  ctx.beginPath()
  ctx.moveTo(18 * scale, 6 * scale)
  ctx.lineTo(13 * scale, 15 * scale)
  ctx.lineTo(16 * scale, 15 * scale)
  ctx.lineTo(15 * scale, 22 * scale)
  ctx.lineTo(20 * scale, 13 * scale)
  ctx.lineTo(17 * scale, 13 * scale)
  ctx.closePath()
  ctx.fill()

  writeFileSync(outputPath, canvas.toBuffer('image/png'))
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

generateIcon(192, 'public/pwa-192x192.png')
generateIcon(512, 'public/pwa-512x512.png')
console.log('Icons generated.')
```

- [ ] **Step 3: Run the script**

Run: `node scripts/generate-pwa-icons.mjs`
Expected: `public/pwa-192x192.png` and `public/pwa-512x512.png` created

- [ ] **Step 4: Remove the script and commit icons**

Run: `rm scripts/generate-pwa-icons.mjs`

```bash
git add public/pwa-192x192.png public/pwa-512x512.png
git commit -m "feat: add PWA icons (192x192, 512x512)"
```

---

## Spec Coverage Check

| Spec Section | Task |
|---|---|
| vite-plugin-pwa install | Task 1 |
| Manifest configuration | Task 2 |
| CacheFirst strategy (globPatterns) | Task 2 |
| registerType: 'prompt' | Task 2 |
| PwaUpdater component (needRefresh + refresh button) | Task 3 |
| offlineReady toast | Task 3 |
| Mount PwaUpdater in main.jsx | Task 4 |
| PWA icons (192×192, 512×512) | Task 5 |
| Silent update (autoUpdate registerType not used) | Task 2 — registerType is 'prompt', not 'autoUpdate' |

All spec items are covered. No placeholders in any step.
