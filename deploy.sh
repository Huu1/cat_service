#!/bin/bash

echo "开始部署..."

# 设置环境变量
export NODE_ENV=production

# 从代码仓库拉取最新代码
echo "拉取最新代码..."
git pull origin main  # 根据你的分支名称调整，可能是 master 或其他分支名

# 安装依赖
echo "安装依赖..."
pnpm install

# 构建项目
echo "构建项目..."
pnpm run build

# 运行数据库迁移
echo "执行数据库迁移..."
npx typeorm migration:run -d dist/config/typeorm.config.js

# 使用 PM2 重启服务
echo "重启服务..."
pm2 restart ecosystem.config.js

echo "部署完成"