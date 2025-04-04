const { DataSource } = require('typeorm');
const { ConfigService } = require('@nestjs/config');
const { config } = require('dotenv');
const path = require('path');

// 根据环境加载对应的配置文件
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'development' 
    ? '.env.development'
    : '.env';

config({ path: path.resolve(process.cwd(), envFile) });

const configService = new ConfigService();

// 创建数据源
const dataSource = new DataSource({
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT'), 10),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [
    path.join(__dirname, '..', 'common', 'entities', '*.entity.{ts,js}'),
    path.join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')
  ],
  migrations: [path.join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});

module.exports = dataSource;