#!/bin/zsh
set -e

cd "$(dirname "$0")"

BUNDLED_NODE="/Users/guhanxiao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
BUNDLED_PNPM="/Users/guhanxiao/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm"

if [ -x "$BUNDLED_NODE" ]; then
  NODE_BIN="$BUNDLED_NODE"
elif command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  echo "没有找到 Node.js，无法启动服务器。"
  echo "请在 Codex 里让我帮你重新启动，或先安装 Node.js。"
  read -k 1 "?按任意键退出..."
  exit 1
fi

if [ ! -f "node_modules/vite/bin/vite.js" ]; then
  if [ -x "$BUNDLED_PNPM" ]; then
    echo "第一次启动需要准备依赖，正在安装..."
    "$BUNDLED_PNPM" install || true
    "$NODE_BIN" node_modules/.pnpm/esbuild@*/node_modules/esbuild/install.js 2>/dev/null || true
  fi
fi

if [ ! -f "node_modules/vite/bin/vite.js" ]; then
  echo "依赖还没有准备好，找不到 Vite。"
  echo "请在 Codex 里让我帮你修复依赖。"
  read -k 1 "?按任意键退出..."
  exit 1
fi

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "你的电脑IP")"
PORT=5174

clear
echo "星火爆爆队服务器启动中..."
echo ""
echo "电脑本机打开："
echo "  http://127.0.0.1:$PORT/"
echo ""
echo "手机同 Wi-Fi 打开："
echo "  http://$LAN_IP:$PORT/"
echo ""
echo "如果手机打不开，请确认电脑和手机在同一个 Wi-Fi，并允许 macOS 的网络访问提示。"
echo "关闭这个窗口即可停止服务器。"
echo ""

"$NODE_BIN" node_modules/vite/bin/vite.js --host 0.0.0.0 --port "$PORT"
