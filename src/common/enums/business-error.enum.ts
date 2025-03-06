export enum BusinessError {
  // 通用错误码
  COMMON_ERROR = 10000,           // 通用错误
  PARAMS_ERROR = 10001,           // 参数错误
  NOT_FOUND = 10002,              // 资源未找到
  UNAUTHORIZED = 10003,           // 未授权
  FORBIDDEN = 10004,              // 无权限访问
  CAPTCHA_ERROR = 10005,              // 验证码错误
  
  // 用户相关错误码 11xxx
  USER_NOT_FOUND = 11001,         // 用户不存在
  USER_PASSWORD_ERROR = 11002,    // 密码错误
  USER_DISABLED = 11003,          // 用户已禁用
  
  // 角色相关错误码 12xxx
  ROLE_NOT_FOUND = 12001,         // 角色不存在
  
  // 其他业务错误码...
  // 账本
  DEFAULT_BOOK_DELETE=13001,   默认账本
}
