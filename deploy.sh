#!/bin/bash

# 构建项目
npm run build

# 创建部署文件夹
rm -rf deploy
mkdir -p deploy

# 复制必要文件
cp -r dist package.json ecosystem.config.js src tsconfig.json deploy/

# 创建一个临时的.env文件，包含生产环境的数据库配置
cat > deploy/.env << EOL
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=hy
DB_PASSWORD=hy123456
DB_DATABASE=book
# Redis配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
EOL

# 创建压缩包
cd deploy
tar -czf deploy.tar.gz *

# 上传到服务器
scp deploy.tar.gz root@106.54.210.11:/www/wwwroot/services/cat_service/

# 远程执行部署命令
ssh root@106.54.210.11 "cd /www/wwwroot/services/cat_service && \
  tar -xzf deploy.tar.gz && \
  /www/server/nodejs/v18.16.1/bin/pnpm install && \
  NODE_ENV=production DB_HOST=127.0.0.1 DB_PORT=3306 DB_USERNAME=hy DB_PASSWORD=hy123456 DB_DATABASE=book \
  /www/server/nodejs/v18.16.1/bin/pnpm run typeorm:run-migrations && \
  pm2 reload ecosystem.config.js"

# 清理本地文件
cd ..
rm -rf deploy