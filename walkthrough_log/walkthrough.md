# Smart-Gym 构建完成 Walkthrough

## 完成内容

基于 README 描述，从零构建了完整的训练计划管理与语音提示 Web 应用。

## 新增 / 修改文件

| 文件 | 说明 |
|------|------|
| [pyproject.toml](file:///Users/shojodan/smart-gym/pyproject.toml) | 新增 flask、gtts、pydub 依赖 |
| [src/plans_store.py](file:///Users/shojodan/smart-gym/src/plans_store.py) | 训练计划 JSON 存储 CRUD |
| [src/api.py](file:///Users/shojodan/smart-gym/src/api.py) | Flask REST API（计划增删改查 + 音频生成） |
| [src/instructor_audio.py](file:///Users/shojodan/smart-gym/src/instructor_audio.py) | 新增 buffer 接口供 API 调用 |
| [main.py](file:///Users/shojodan/smart-gym/main.py) | 启动 Flask 应用 |
| [templates/index.html](file:///Users/shojodan/smart-gym/templates/index.html) | 单页应用 HTML |
| [static/style.css](file:///Users/shojodan/smart-gym/static/style.css) | 暗色主题 CSS |
| [static/app.js](file:///Users/shojodan/smart-gym/static/app.js) | 前端 CRUD + 音频交互 JS |

## UI 截图

![Smart Gym 应用界面](/Users/shojodan/.gemini/antigravity/brain/313a8893-e4f0-460d-8224-b2ffd44eb7e5/ui_screenshot.png)

应用正常加载，预置的 Day 1 计划自动显示，含全部 4 个动作及各参数。

## 启动方式

```bash
cd /Users/shojodan/smart-gym
uv run python main.py
# 打开 http://127.0.0.1:5001
```

## 核心功能

- 计划管理：侧边栏列表，支持新建、编辑、删除
- 动作编辑：动态增减卡片，可设置组数、次数、休息时长、节奏
- 语音音频：生成带语音提示的 MP3，页面内播放
- 预置数据：首次运行自动写入 Day 1 示例计划

> [!NOTE]
> 生成音频依赖 gTTS（需联网）和 ffmpeg（本地），可用 `brew install ffmpeg` 安装。
