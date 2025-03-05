export const databaseConfig = {
  type: 'mysql',
  // ... 其他配置 ...
  synchronize: true, // 开发环境可以开启，生产环境建议关闭
  logging: true,
  charset: 'utf8mb4',
  timezone: '+08:00',
}