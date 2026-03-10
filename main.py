import sys
import os

# 确保 src 目录在 Python 路径中
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from api import create_app

def main():
    app = create_app()
    print("🏋️  Smart-Gym 已启动，访问 http://127.0.0.1:5001")
    app.run(debug=True, host="0.0.0.0", port=5001)


if __name__ == "__main__":
    main()
