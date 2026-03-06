#!/bin/bash

# 知行周刊 - Gitee 部署脚本（原始代码库）
# 使用方式：./deploy-zhixing-to-gitee.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "🚀 知行周刊 - Gitee 部署脚本"
echo "========================================"
echo ""

# 检查 Gitee Token
if [ -z "$GITEE_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  未设置 GITEE_TOKEN 环境变量${NC}"
    echo ""
    echo "请先获取 Gitee Token:"
    echo "1. 访问：https://gitee.com/personal_access_tokens"
    echo "2. 生成新令牌（勾选 projects 权限）"
    echo "3. 复制 Token 并执行:"
    echo ""
    echo "   export GITEE_TOKEN=你的 token"
    echo "   ./deploy-zhixing-to-gitee.sh"
    echo ""
    exit 1
fi

# 获取 Gitee 用户名
echo "📋 正在获取 Gitee 用户信息..."
USER_INFO=$(curl -s "https://gitee.com/api/v5/user?access_token=$GITEE_TOKEN")
GITEE_LOGIN=$(echo "$USER_INFO" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)

if [ -z "$GITEE_LOGIN" ]; then
    echo -e "${RED}❌ 无法获取 Gitee 用户信息，请检查 Token 是否有效${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 已登录 Gitee 用户：$GITEE_LOGIN${NC}"
echo ""

# 检查本地仓库
REPO_DIR="$HOME/Desktop/zhixing-weekly"
if [ ! -d "$REPO_DIR" ]; then
    echo -e "${RED}❌ 本地仓库不存在：$REPO_DIR${NC}"
    exit 1
fi

cd "$REPO_DIR"

# 检查 Gitee 仓库是否存在
echo "🔍 检查 Gitee 仓库是否存在..."
REPO_CHECK=$(curl -s "https://gitee.com/api/v5/repos/$GITEE_LOGIN/zhixing-weekly?access_token=$GITEE_TOKEN")
REPO_EXISTS=$(echo "$REPO_CHECK" | grep -o '"full_name"' | head -1)

if [ -z "$REPO_EXISTS" ]; then
    echo "📦 Gitee 仓库不存在，正在创建..."
    
    CREATE_RESPONSE=$(curl -s -X POST "https://gitee.com/api/v5/user/repos" \
        -H "Content-Type: application/json" \
        -d "{
            \"access_token\": \"$GITEE_TOKEN\",
            \"name\": \"zhixing-weekly\",
            \"description\": \"知行周刊 - 原始代码库\",
            \"homepage\": \"https://$GITEE_LOGIN.gitee.io/zhixing-weekly/\",
            \"has_issues\": false,
            \"has_wiki\": false,
            \"has_pages\": true,
            \"auto_init\": false
        }")
    
    if echo "$CREATE_RESPONSE" | grep -q '"full_name"'; then
        echo -e "${GREEN}✅ Gitee 仓库创建成功${NC}"
    else
        echo -e "${RED}❌ 创建失败：$CREATE_RESPONSE${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Gitee 仓库已存在${NC}"
    # 更新现有仓库
    echo "🔄 更新现有仓库..."
fi

echo ""

# 添加/更新 Gitee 远程仓库
echo "🔗 配置 Gitee 远程仓库..."
if git remote | grep -q "gitee"; then
    git remote set-url gitee "https://$GITEE_LOGIN:$GITEE_TOKEN@gitee.com/$GITEE_LOGIN/zhixing-weekly.git"
    echo "✅ 更新现有 gitee remote"
else
    git remote add gitee "https://$GITEE_LOGIN:$GITEE_TOKEN@gitee.com/$GITEE_LOGIN/zhixing-weekly.git"
    echo "✅ 添加新的 gitee remote"
fi

echo ""

# 确保所有文件已提交
echo "📝 检查本地更改..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  有未提交的更改，正在提交..."
    git add .
    git commit -m "同步最新内容"
fi

# 推送到 Gitee
echo "📤 正在推送到 Gitee..."
if git push -f gitee main; then
    echo -e "${GREEN}✅ 推送成功！${NC}"
else
    # 尝试 master 分支
    echo -e "${YELLOW}⚠️  main 分支推送失败，尝试 master 分支...${NC}"
    if git push -f gitee master; then
        echo -e "${GREEN}✅ 推送到 master 分支成功！${NC}"
    else
        echo -e "${RED}❌ 推送失败${NC}"
        exit 1
    fi
fi

echo ""

# 启用 Gitee Pages
echo "🌐 正在启用 Gitee Pages..."
PAGES_RESPONSE=$(curl -s -X POST "https://gitee.com/api/v5/repos/$GITEE_LOGIN/zhixing-weekly/pages" \
    -H "Content-Type: application/json" \
    -d "{
        \"access_token\": \"$GITEE_TOKEN\",
        \"branch\": \"main\",
        \"path\": \"/\",
        \"enforce_ssl\": true
    }")

if echo "$PAGES_RESPONSE" | grep -q '"url"'; then
    echo -e "${GREEN}✅ Gitee Pages 已启用${NC}"
else
    # 尝试 master 分支
    PAGES_RESPONSE=$(curl -s -X POST "https://gitee.com/api/v5/repos/$GITEE_LOGIN/zhixing-weekly/pages" \
        -H "Content-Type: application/json" \
        -d "{
            \"access_token\": \"$GITEE_TOKEN\",
            \"branch\": \"master\",
            \"path\": \"/\",
            \"enforce_ssl\": true
        }")
    
    if echo "$PAGES_RESPONSE" | grep -q '"url"'; then
        echo -e "${GREEN}✅ Gitee Pages 已启用（master 分支）${NC}"
    else
        echo -e "${YELLOW}⚠️  Pages 可能已启用或正在构建中${NC}"
    fi
fi

echo ""
echo "========================================"
echo "🎉 部署完成！"
echo "========================================"
echo ""
echo "📍 访问地址:"
echo "   Gitee Pages: https://$GITEE_LOGIN.gitee.io/zhixing-weekly/"
echo "   GitHub Pages: https://464263625jxd-hue.github.io/zhixing-weekly/"
echo ""
echo "⏱️  Gitee Pages 构建需要 1-2 分钟，请稍后访问"
echo ""
echo "📊 仓库文件:"
ls -lh *.html *.json 2>/dev/null | awk '{print "   " $9 " - " $5}'
echo ""
echo "🔧 配置自动同步（可选）:"
echo "   1. 访问 Gitee 仓库 → 管理 → 镜像管理"
echo "   2. 添加 GitHub 仓库为镜像源"
echo "   3. 开启定时自动更新"
echo ""
