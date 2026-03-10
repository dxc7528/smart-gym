import os
from gtts import gTTS
from pydub import AudioSegment
from pydub.generators import Sine

# --- 配置与缓存 ---
AUDIO_CACHE = {}

def get_speech_audio(text, lang='zh-cn'):
    """获取语音音频，使用内存缓存减少 API 请求"""
    if text in AUDIO_CACHE:
        return AUDIO_CACHE[text]
    
    filename = f"temp_{abs(hash(text))}.mp3"
    tts = gTTS(text=text, lang=lang)
    tts.save(filename)
    audio = AudioSegment.from_mp3(filename)
    os.remove(filename)
    
    AUDIO_CACHE[text] = audio
    return audio

def get_beep(freq=800, duration=200):
    """生成单音节 Beep 提示音（用于休息倒计时等场景）"""
    return Sine(freq).to_audio_segment(duration=duration).apply_gain(-10)

def get_tick():
    """生成短促咔哒声（Tick），用于 Rep 阶段的每秒节拍提示"""
    return Sine(1000).to_audio_segment(duration=30).apply_gain(-15)

def get_silence(seconds):
    """生成空白音频"""
    return AudioSegment.silent(duration=seconds * 1000)

# --- 音频构建逻辑 ---

def _fill_with_ticks(total_sec: float, voice_audio: AudioSegment) -> AudioSegment:
    """
    辅助函数：在语音播完后，用每秒一声 Tick 填满剩余时间。
    总时长精确对齐 total_sec 秒。
    """
    voice_duration = voice_audio.duration_seconds
    segment = voice_audio

    # 下一个 Tick 出现在第 1 整秒、第 2 整秒……直到 total_sec
    # 语音本身占据了开头 voice_duration 秒，从第一个 >voice_duration 的整秒开始打 Tick
    for sec in range(1, int(total_sec) + 1):
        tick_time = float(sec)  # Tick 应出现的绝对时刻（秒）
        current_duration = segment.duration_seconds
        gap = tick_time - current_duration
        if gap < 0:
            # 语音还未播完，跳过这个 Tick
            continue
        segment += get_silence(gap) + get_tick()

    # 最终修正：截断或补齐到精确的 total_sec
    target_ms = int(total_sec * 1000)
    if len(segment) < target_ms:
        segment += get_silence(total_sec - segment.duration_seconds)
    else:
        segment = segment[:target_ms]

    return segment


def build_rep_audio(concentric_sec, isometric_sec, eccentric_sec):
    """
    构建单个 Rep 的音频（语音指令 + Tick 节拍器方案）。

    参数顺序与 tempo 格式一致：[发力(向心), 停顿, 复原(离心)]

    以 tempo=[1,1,3] 为例（发力1s、停顿1s、复原3s，共5s）：
      0s   → 语音"推起" (~0.8s，填满1s向心期)
      1s   → 语音"停"   (~0.5s，填满1s停顿期)
      2s   → 语音"下放" (~0.8s)
      3s   → Tick
      4s   → Tick  → 离心3s结束

    设计原则：语音定性（明确动作），Tick定量（剥离大脑默数秒数的任务）
    """
    # 预生成语音（走缓存，避免重复请求）
    voice_concentric = get_speech_audio("推起")
    voice_isometric  = get_speech_audio("停")
    voice_eccentric  = get_speech_audio("下放")

    # 1. 向心/发力阶段
    rep_audio = _fill_with_ticks(concentric_sec, voice_concentric)

    # 2. 停顿阶段（若有）
    if isometric_sec > 0:
        rep_audio += _fill_with_ticks(isometric_sec, voice_isometric)

    # 3. 离心/复原阶段（通常最长，Tick 最多）
    rep_audio += _fill_with_ticks(eccentric_sec, voice_eccentric)

    return rep_audio

def build_workout_audio(plan_name, exercises):
    """构建完整训练音频"""
    print(f"开始生成计划: {plan_name}...")
    workout_audio = get_speech_audio(f"开始今天的训练：{plan_name}。请做好准备。") + get_silence(3)
    
    for ex_idx, ex in enumerate(exercises):
        name = ex['name']
        sets = ex['sets']
        reps = ex['reps']
        rest = ex['rest']
        tempo = ex['tempo']  # [向心/发力, 停顿, 离心/复原]
        
        trans_rest = ex.get('transition_rest', rest)
        
        # 动作介绍
        workout_audio += get_speech_audio(f"下一个动作：{name}，共 {sets} 组，每组 {reps} 次。") + get_silence(2)
        
        for s in range(sets):
            # 组前倒数
            workout_audio += get_speech_audio(f"第 {s+1} 组，准备。3, 2, 1, 开始。")
            
            # 生成 Reps 循环
            rep_audio = build_rep_audio(tempo[0], tempo[1], tempo[2])
            for r in range(reps):
                workout_audio += rep_audio
            
            # 组间休息 (最后一组且是最后一个动作则不休息)
            is_last_set = (s == sets - 1)
            is_last_exercise = (ex_idx == len(exercises) - 1)
            
            if not (is_last_set and is_last_exercise):
                current_rest = trans_rest if is_last_set else rest

                if is_last_set:
                    workout_audio += get_speech_audio(f"动作完成。休息 {current_rest} 秒，准备切换动作。")
                else:
                    workout_audio += get_speech_audio(f"休息 {current_rest} 秒。")
                
                # 休息时间，最后10秒加入滴答声
                if current_rest > 10:
                    workout_audio += get_silence(current_rest - 10)
                    for _ in range(3):
                        workout_audio += get_beep(freq=1000, duration=100) + get_silence(0.9)
                    workout_audio += get_silence(7) # 留足最后几秒准备
                else:
                    workout_audio += get_silence(current_rest)
    
    workout_audio += get_speech_audio("训练结束，干得漂亮。记得拉伸。")
    
    output_file = f"{plan_name.replace(' ', '_')}.mp3"
    print(f"正在导出 {output_file}，这可能需要几十秒...")
    workout_audio.export(output_file, format="mp3")
    print("导出完成！")


def build_workout_audio_to_buffer(plan_name: str, exercises: list) -> bytes:
    """构建完整训练音频，返回 MP3 bytes（供 Web API 使用）"""
    import io
    print(f"开始生成计划（buffer 模式）: {plan_name}...")
    workout_audio = get_speech_audio(f"开始今天的训练：{plan_name}。请做好准备。") + get_silence(3)

    for ex_idx, ex in enumerate(exercises):
        name = ex['name']
        sets = ex['sets']
        reps = ex['reps']
        rest = ex['rest']
        tempo = ex['tempo']  # [向心/发力, 停顿, 离心/复原]

        trans_rest = ex.get('transition_rest', rest)

        workout_audio += get_speech_audio(f"下一个动作：{name}，共 {sets} 组，每组 {reps} 次。") + get_silence(2)

        for s in range(sets):
            workout_audio += get_speech_audio(f"第 {s+1} 组，准备。3, 2, 1, 开始。")
            rep_audio = build_rep_audio(tempo[0], tempo[1], tempo[2])
            for r in range(reps):
                workout_audio += rep_audio

            is_last_set = (s == sets - 1)
            is_last_exercise = (ex_idx == len(exercises) - 1)

            if not (is_last_set and is_last_exercise):
                current_rest = trans_rest if is_last_set else rest

                if is_last_set:
                    workout_audio += get_speech_audio(f"动作完成。休息 {current_rest} 秒，准备切换动作。")
                else:
                    workout_audio += get_speech_audio(f"休息 {current_rest} 秒。")

                if current_rest > 10:
                    workout_audio += get_silence(current_rest - 10)
                    for _ in range(3):
                        workout_audio += get_beep(freq=1000, duration=100) + get_silence(0.9)
                    workout_audio += get_silence(7)
                else:
                    workout_audio += get_silence(current_rest)

    workout_audio += get_speech_audio("训练结束，干得漂亮。记得拉伸。")

    buf = io.BytesIO()
    workout_audio.export(buf, format="mp3")
    print("生成完成（buffer 模式）！")
    return buf.getvalue()

# --- 课表数据 ---

day1_plan = [
    {
        "name": "手把俯卧撑",
        "sets": 3,
        "reps": 12,
        "rest": 60,
        "tempo": [2, 1, 2] # 2秒下放，1秒停顿，2秒推起
    },
    {
        "name": "引体架双杠臂屈伸",
        "sets": 3,
        "reps": 8,
        "rest": 90,
        "tempo": [3, 1, 2] # 3秒离心对抗重力，保护食管
    },
    {
        "name": "弹力绳推举",
        "sets": 3,
        "reps": 20,
        "rest": 45,
        "tempo": [1, 0, 1] # 较轻重量，快速收缩
    },
    {
        "name": "悬垂举腿",
        "sets": 3,
        "reps": 12,
        "rest": 60,
        "tempo": [2, 1, 1] # 2秒放下，顶峰收缩1秒
    }
]

if __name__ == "__main__":
    build_workout_audio("Day_1_推力与核心", day1_plan)