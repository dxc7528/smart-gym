# 新增锻炼计划设计

## 概述

为 smart-gym 添加三个新预置锻炼计划：
1. 晨间唤醒瑜伽 (Morning Wake-up Yoga)
2. 攀岩指力训练 (Hangboard Finger Strength)
3. 夜间放松拉伸 (Evening Relaxation Stretch)

## 练习数据结构

每个练习对象结构（与现有结构一致）：

```javascript
{
  name: string,           // 动作名称
  sets: number,          // 组数
  reps: number,          // 次数（瑜伽/拉伸用秒数时填 1）
  rest: number,          // 组间休息（秒）
  transition_rest: number, // 动作间过渡休息（秒）
  tempo: [number, number, number], // 节奏 [举起, 暂停, 放下]
}
```

---

## 计划 1: 晨间唤醒瑜伽 (Morning Wake-up Yoga)

**时长**: ~12分钟 | **风格**: 动态流瑜伽

| 动作 | sets | reps | rest | transition_rest | tempo |
|------|------|------|------|-----------------|-------|
| 猫牛式 (Cat-Cow) | 1 | 10 | 15 | 30 | [1,0,1] |
| 拜日式 A (Sun Salutation A) | 1 | 3 | 30 | 60 | [1,1,1] |
| 战士 I (Warrior I) | 1 | 1 | 15 | 30 | [1,0,1] |
| 战士 II (Warrior II) | 1 | 1 | 15 | 30 | [1,0,1] |
| 下犬式 (Downward Dog) | 1 | 1 | 15 | 30 | [1,0,1] |
| 髋屈肌伸展 (Hip Flexor Stretch) | 1 | 1 | 15 | 30 | [1,0,1] |
| 仰卧脊柱扭转 (Supine Twist) | 1 | 1 | 15 | 30 | [1,0,1] |

**节奏说明**: 瑜伽动作用 `tempo: [1,0,1]` 表示流畅转换，无明显暂停。

---

## 计划 2: 攀岩指力训练 (Hangboard Finger Strength)

**设备**: Trango / Tension 训练架（支持负重调节）

| 动作 | sets | reps | rest | transition_rest | tempo |
|------|------|------|------|-----------------|-------|
| 开放握悬挂 (Open Hand Hang) | 5 | 1 | 180 | 120 | [0,7,0] |
| 半握悬挂 (Half Crimp Hang) | 5 | 1 | 180 | 120 | [0,7,0] |
| 指力板滑动 (Finger Board Slide) | 3 | 1 | 120 | 90 | [0,5,0] |

**说明**:
- `reps: 1` + `tempo: [0,7,0]` 表示每次保持7秒
- 负重根据个人能力在训练架上调节
- 5+5+3 = 13组，总约15-18分钟（含休息）

---

## 计划 3: 夜间放松拉伸 (Evening Relaxation Stretch)

**时长**: ~15分钟 | **风格**: 恢复性拉伸

| 动作 | sets | reps | rest | transition_rest | tempo |
|------|------|------|------|-----------------|-------|
| 深呼吸激活 (Deep Breathing) | 1 | 12 | 0 | 30 | [4,2,0] |
| 胸部开放伸展 (Chest Opener) | 1 | 1 | 15 | 30 | [1,0,1] |
| 猫牛式 (Cat-Cow) | 1 | 10 | 15 | 30 | [1,0,1] |
| 婴儿式 (Child's Pose) | 1 | 1 | 15 | 30 | [1,0,1] |
| 鸽子式 (Pigeon Pose) | 1 | 1 | 15 | 30 | [1,0,1] |
| 仰卧抱膝 (Knee-to-Chest) | 1 | 1 | 15 | 30 | [1,0,1] |
| 腿后链拉伸 (Supine Hamstring) | 1 | 1 | 15 | 30 | [1,0,1] |

**节奏说明**: 深呼吸用 `tempo: [4,2,0]` 表示4秒吸气、2秒屏息、0秒呼气（实际时长通过 reps 控制）。

---

## 实现方式

修改 `src/store/plansStore.js` 中的 `DEFAULT_PLANS` 数组，追加三个新计划。

预置计划在 `seedDefaultPlans()` 中通过 `createPlan()` 写入 localStorage，首次加载时自动创建。

---

## 验收标准

- [ ] 三个新计划在应用首次加载后出现在计划列表中
- [ ] 每个计划包含正确的动作数量和参数
- [ ] 现有默认计划 "Day 1 - Upper Body Push & Core" 保持不变
