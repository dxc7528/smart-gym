"""
plans_store.py - 训练计划的 JSON 文件存储（CRUD）
数据文件位于 data/plans.json
"""

import json
import os
import uuid
from typing import List, Optional

# 数据文件路径（相对于项目根目录）
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DATA_FILE = os.path.join(DATA_DIR, "plans.json")


def _ensure_data_file():
    """确保数据目录和文件存在"""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        _write_plans([])


def _read_plans() -> List[dict]:
    _ensure_data_file()
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_plans(plans: List[dict]):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(plans, f, ensure_ascii=False, indent=2)


# ---- 公共 CRUD 接口 ----

def get_all_plans() -> List[dict]:
    return _read_plans()


def get_plan(plan_id: str) -> Optional[dict]:
    plans = _read_plans()
    return next((p for p in plans if p["id"] == plan_id), None)


def create_plan(name: str, exercises: List[dict]) -> dict:
    plans = _read_plans()
    new_plan = {
        "id": str(uuid.uuid4()),
        "name": name,
        "exercises": exercises,
    }
    plans.append(new_plan)
    _write_plans(plans)
    return new_plan


def update_plan(plan_id: str, name: str, exercises: List[dict]) -> Optional[dict]:
    plans = _read_plans()
    for i, p in enumerate(plans):
        if p["id"] == plan_id:
            plans[i] = {"id": plan_id, "name": name, "exercises": exercises}
            _write_plans(plans)
            return plans[i]
    return None


def delete_plan(plan_id: str) -> bool:
    plans = _read_plans()
    new_plans = [p for p in plans if p["id"] != plan_id]
    if len(new_plans) == len(plans):
        return False
    _write_plans(new_plans)
    return True


# ---- 预置示例数据（首次运行时自动写入） ----

DEFAULT_PLANS = [
    {
        "name": "Day 1 - 上肢推力与核心",
        "exercises": [
            {"name": "手把俯卧撑", "sets": 3, "reps": 12, "rest": 60, "tempo": [2, 1, 2]},
            {"name": "双杠臂屈伸", "sets": 3, "reps": 8, "rest": 90, "tempo": [2, 1, 3]},
            {"name": "侧平举", "sets": 3, "reps": 20, "rest": 45, "tempo": [1, 1, 3]},
            {"name": "悬垂举腿", "sets": 3, "reps": 12, "rest": 60, "tempo": [1, 1, 2]},
        ],
    }
]


def seed_default_plans():
    """如果没有任何计划，插入示例计划"""
    if not get_all_plans():
        for p in DEFAULT_PLANS:
            create_plan(p["name"], p["exercises"])
