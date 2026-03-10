"""
reports_store.py - 训练完成报告的存储与 Markdown 生成
报告文件位于 data/reports/
"""

import json
import os
import uuid
from datetime import datetime
from typing import List, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
REPORTS_DIR = os.path.join(DATA_DIR, "reports")


def _ensure_reports_dir():
    os.makedirs(REPORTS_DIR, exist_ok=True)


SCORE_LABELS = {
    3: "⭐⭐⭐ 完成全部",
    2: "⭐⭐　 完成约80%",
    1: "⭐　　 完成约50%",
    0: "✗　　 无法完成",
}


def save_report(plan_id: str, plan_name: str, exercise_scores: list, notes: str = "") -> dict:
    """
    保存训练报告并生成 Markdown 文件。

    exercise_scores: [
        {"name": "手把俯卧撑", "score": 3, "difficulty": "无"},
        ...
    ]
    返回 report dict（含 id、md_path、md_content）。
    """
    _ensure_reports_dir()

    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")
    report_id = str(uuid.uuid4())[:8]

    # 计算总完成度
    max_score = len(exercise_scores) * 3
    actual_score = sum(e.get("score", 0) for e in exercise_scores)
    pct = round(actual_score / max_score * 100) if max_score else 0

    report = {
        "id": report_id,
        "plan_id": plan_id,
        "plan_name": plan_name,
        "date": date_str,
        "time": time_str,
        "exercises": exercise_scores,
        "notes": notes,
        "completion_pct": pct,
    }

    # 生成 Markdown
    md = _generate_md(report)
    report["md_content"] = md

    # 保存 JSON
    safe_name = plan_name.replace(" ", "_").replace("/", "-")
    json_filename = f"{date_str}_{report_id}_{safe_name}.json"
    json_path = os.path.join(REPORTS_DIR, json_filename)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # 保存 Markdown
    md_filename = f"{date_str}_{report_id}_{safe_name}.md"
    md_path = os.path.join(REPORTS_DIR, md_filename)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md)

    report["md_path"] = md_path
    report["json_path"] = json_path
    return report


def _generate_md(report: dict) -> str:
    plan_name = report["plan_name"]
    date_str = report["date"]
    time_str = report["time"]
    exercises = report["exercises"]
    notes = report.get("notes", "").strip()
    pct = report["completion_pct"]

    lines = [
        f"# 训练总结：{plan_name}",
        "",
        f"**日期**：{date_str} {time_str}",
        f"**计划**：{plan_name}",
        "",
        "## 动作评分",
        "",
        "| 动作 | 完成度 | 难点描述 |",
        "|------|--------|---------|",
    ]

    for ex in exercises:
        name = ex.get("name", "")
        score = ex.get("score", 0)
        difficulty = ex.get("difficulty", "").strip() or "—"
        label = SCORE_LABELS.get(score, f"{score}/3")
        lines.append(f"| {name} | {label} | {difficulty} |")

    lines += [
        "",
        "## 总体完成度",
        "",
        f"**{pct}%**（{sum(e.get('score',0) for e in exercises)} ÷ {len(exercises) * 3} × 100%）",
        "",
    ]

    if notes:
        lines += ["## 备注", "", notes, ""]

    return "\n".join(lines)


def get_all_reports() -> List[dict]:
    """返回所有报告的元数据列表（不含 md_content），按日期倒序。"""
    _ensure_reports_dir()
    reports = []
    for fname in sorted(os.listdir(REPORTS_DIR), reverse=True):
        if fname.endswith(".json"):
            path = os.path.join(REPORTS_DIR, fname)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    r = json.load(f)
                    reports.append(r)
            except Exception:
                pass
    return reports
