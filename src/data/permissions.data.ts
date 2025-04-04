export const permissionsData = [
  // 角色权限
  { code: 'role:create', name: '创建角色', description: '允许创建新角色' },
  { code: 'role:read', name: '查看角色', description: '允许查看角色列表和详情' },
  { code: 'role:update', name: '更新角色', description: '允许修改角色信息' },
  { code: 'role:delete', name: '删除角色', description: '允许删除角色' },
  
  // 权限点权限
  { code: 'permission:create', name: '创建权限', description: '允许创建新权限' },
  { code: 'permission:read', name: '查看权限', description: '允许查看权限列表和详情' },
  { code: 'permission:update', name: '更新权限', description: '允许修改权限信息' },
  { code: 'permission:delete', name: '删除权限', description: '允许删除权限' },

  // 用户权限
  { code: 'user:create', name: '创建用户', description: '允许创建新用户' },
  { code: 'user:read', name: '查看用户', description: '允许查看用户列表和详情' },
  { code: 'user:update', name: '更新用户', description: '允许修改用户信息' },
  { code: 'user:delete', name: '删除用户', description: '允许删除用户' },
];

export const rolesData = [
  {
    code: 'super_admin',
    name: '超级管理员',
    description: '超级管理员，拥有所有权限',
    allPermissions: true,
  },
  {
    code: 'admin',
    name: '系统管理员',
    description: '系统管理员，拥有所有权限',
    allPermissions: true,
  },
  {
    code: 'user',
    name: '普通用户',
    description: '普通用户，拥有基本权限',
    permissionCodes: ['user:read'],
  },
];