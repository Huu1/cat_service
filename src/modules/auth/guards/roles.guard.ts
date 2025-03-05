import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // 如果用户有 admin 角色，直接放行
    if (user?.roles && user.roles.includes('admin')) {
      return true;
    }

    // 否则检查是否具有所需角色
    return requiredRoles.some(role => 
      user?.roles && user.roles.includes(role)
    );
  }
}