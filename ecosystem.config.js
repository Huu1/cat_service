module.exports = {
  apps: [{
    name: "book-service",
    script: "./dist/main.js",
    env: {
      NODE_ENV: "production",
      // MySQL配置
      DB_HOST: "127.0.0.1",
      DB_PORT: 3306,
      DB_USERNAME: "hy",
      DB_PASSWORD: "hy123456",
      DB_DATABASE: "book",

      // Redis配置
      REDIS_HOST: "127.0.0.1",
      REDIS_PORT: 6379,

      // 小程序配置
      JWT_SECRET: "123456",
      WECHAT_APPID: "wx41dfbbbd61642db0",
      WECHAT_SECRET: "6de54106d4d5e1894ab5c3b836de132e",

      // 初始化admin
      SUPER_ADMIN_USERNAME: "superadmin",
      SUPER_ADMIN_PASSWORD: "hy123456",
      ADMIN_USERNAME: "admin",
      ADMIN_PASSWORD: "admin",
      USER_USERNAME: "user",
      USER_PASSWORD: "user",
      UPLOAD_DIR: "uploads",
      MAX_FILE_SIZE: 10485760,
      APP_URL: 'http://106.54.210.11:3000',
    },
    cwd: "/www/wwwroot/services/cat_service",
    watch: false,
    instances: 1,
    exec_mode: "fork"
  }]
};