"""
api.py - Flask REST API 入口
"""

import io
import os
import sys
import tempfile

from flask import Flask, jsonify, render_template, request, send_file

# 确保 src 目录在路径中
sys.path.insert(0, os.path.dirname(__file__))

from plans_store import (
    create_plan,
    delete_plan,
    get_all_plans,
    get_plan,
    seed_default_plans,
    update_plan,
)

app = Flask(
    __name__,
    template_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates"),
    static_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), "static"),
)


# ---------- 前端入口 ----------


@app.route("/")
def index():
    return render_template("index.html")


# ---------- 训练计划 CRUD ----------


@app.route("/api/plans", methods=["GET"])
def list_plans():
    return jsonify(get_all_plans())


@app.route("/api/plans", methods=["POST"])
def add_plan():
    data = request.get_json(force=True)
    name = data.get("name", "").strip()
    exercises = data.get("exercises", [])
    if not name:
        return jsonify({"error": "计划名称不能为空"}), 400
    plan = create_plan(name, exercises)
    return jsonify(plan), 201


@app.route("/api/plans/<plan_id>", methods=["PUT"])
def edit_plan(plan_id):
    data = request.get_json(force=True)
    name = data.get("name", "").strip()
    exercises = data.get("exercises", [])
    if not name:
        return jsonify({"error": "计划名称不能为空"}), 400
    plan = update_plan(plan_id, name, exercises)
    if plan is None:
        return jsonify({"error": "计划不存在"}), 404
    return jsonify(plan)


@app.route("/api/plans/<plan_id>", methods=["DELETE"])
def remove_plan(plan_id):
    if not delete_plan(plan_id):
        return jsonify({"error": "计划不存在"}), 404
    return jsonify({"message": "已删除"}), 200


# ---------- 音频生成 ----------


@app.route("/api/plans/<plan_id>/generate-audio", methods=["POST"])
def generate_audio(plan_id):
    plan = get_plan(plan_id)
    if plan is None:
        return jsonify({"error": "计划不存在"}), 404

    try:
        # 延迟导入，避免启动时强制依赖 ffmpeg
        from instructor_audio import build_workout_audio_to_buffer

        audio_bytes = build_workout_audio_to_buffer(plan["name"], plan["exercises"])
        return send_file(
            io.BytesIO(audio_bytes),
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name=f"{plan['name']}.mp3",
        )
    except Exception as e:
        return jsonify({"error": f"音频生成失败：{str(e)}"}), 500


# ---------- 启动 ----------


def create_app():
    seed_default_plans()
    return app


if __name__ == "__main__":
    create_app().run(debug=True, port=5000)
