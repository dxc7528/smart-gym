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
    """生成单音节 Beep 提示音"""
    return Sine(freq).to_audio_segment(duration=duration).apply_gain(-10)

def get_silence(seconds):
    """生成空白音频"""
    return AudioSegment.silent(duration=seconds * 1000)

# --- 音频构建逻辑 ---

def build_rep_audio(eccentric_sec, isometric_sec, concentric_sec):
    """
    构建单个 Rep 的音频 (Tempo 引导)
    例如 2-1-2 节奏:
    - 离心下放 (2秒): 低频提示音开始 + 2秒空白
    - 底部停顿 (1秒): 中频提示音开始 + 1秒空白
    - 向心发力 (2秒): 高频提示音开始 + 2秒空白
    """
    beep_down = get_beep(freq=400, duration=200)   # 低音：下放
    beep_pause = get_beep(freq=600, duration=200)  # 中音：停顿
    beep_up = get_beep(freq=800, duration=200)     # 高音：发力推/拉

    rep_audio = beep_down + get_silence(eccentric_sec - 0.2)
    if isometric_sec > 0:
        rep_audio += beep_pause + get_silence(isometric_sec - 0.2)
    rep_audio += beep_up + get_silence(concentric_sec - 0.2)
    
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
        tempo = ex['tempo'] # [离心, 停顿, 向心]
        
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
                if is_last_set:
                    workout_audio += get_speech_audio(f"动作完成。休息 {rest} 秒，准备切换动作。")
                else:
                    workout_audio += get_speech_audio(f"休息 {rest} 秒。")
                
                # 休息时间，最后10秒加入滴答声
                if rest > 10:
                    workout_audio += get_silence(rest - 10)
                    for _ in range(3):
                        workout_audio += get_beep(freq=1000, duration=100) + get_silence(0.9)
                    workout_audio += get_silence(7) # 留足最后几秒准备
                else:
                    workout_audio += get_silence(rest)
    
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
        tempo = ex['tempo']

        workout_audio += get_speech_audio(f"下一个动作：{name}，共 {sets} 组，每组 {reps} 次。") + get_silence(2)

        for s in range(sets):
            workout_audio += get_speech_audio(f"第 {s+1} 组，准备。3, 2, 1, 开始。")
            rep_audio = build_rep_audio(tempo[0], tempo[1], tempo[2])
            for r in range(reps):
                workout_audio += rep_audio

            is_last_set = (s == sets - 1)
            is_last_exercise = (ex_idx == len(exercises) - 1)

            if not (is_last_set and is_last_exercise):
                if is_last_set:
                    workout_audio += get_speech_audio(f"动作完成。休息 {rest} 秒，准备切换动作。")
                else:
                    workout_audio += get_speech_audio(f"休息 {rest} 秒。")

                if rest > 10:
                    workout_audio += get_silence(rest - 10)
                    for _ in range(3):
                        workout_audio += get_beep(freq=1000, duration=100) + get_silence(0.9)
                    workout_audio += get_silence(7)
                else:
                    workout_audio += get_silence(rest)

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