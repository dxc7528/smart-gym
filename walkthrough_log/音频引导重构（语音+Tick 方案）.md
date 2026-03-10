# Walkthrough：Rep 音频引导重构（语音+Tick 方案）

## 完成的改动

**文件**：[instructor_audio.py](file:///Users/shojodan/smart-gym/src/instructor_audio.py)

### 新增

| 函数 | 说明 |
|------|------|
| [get_tick()](file:///Users/shojodan/smart-gym/src/instructor_audio.py#27-30) | 30ms / 1000Hz 短促咔哒声，gain -15dB |
| [_fill_with_ticks(total_sec, voice_audio)](file:///Users/shojodan/smart-gym/src/instructor_audio.py#37-64) | 辅助函数：语音播完后，在每整秒位置插入 Tick，最终精确截断/补齐到 `total_sec` |

### 修改

[build_rep_audio(eccentric_sec, isometric_sec, concentric_sec)](file:///Users/shojodan/smart-gym/src/instructor_audio.py#66-99) 完全重写：

- **旧方案**：三段不同频率 beep（400/600/800Hz）区分下放/停顿/推起，认知负担高
- **新方案**：语音"推起/停/下放"标记阶段起点 + Tick 每秒填充持续时间

### 音频时间轴（以 1-1-3 节奏为例）

```
0s ──► 语音"推起" (~0.8s)
1s ──► 语音"停" (~0.5s)
2s ──► 语音"下放" (~0.8s)
3s ──► Tick
4s ──► Tick
(5s   = 离心3s结束)
```

## 验证结果

运行 [/tmp/test_rep_audio.py](file:///tmp/test_rep_audio.py)，4个节奏全部通过：

| 节奏 | 实际时长 | 预期时长 | 状态 |
|------|---------|---------|------|
| 1-1-3 | 5.000s | 5.0s | ✅ |
| 2-1-2 | 5.000s | 5.0s | ✅ |
| 1-0-1 | 2.000s | 2.0s | ✅ |
| 3-1-2 | 6.000s | 6.0s | ✅ |

测试 MP3 文件：[/tmp/test_rep_1_1_3.mp3](file:///tmp/test_rep_1_1_3.mp3)（可直接播放聆听）
