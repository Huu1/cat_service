import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../user/user.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('用户未登录或登录已过期');
    }

    const userWithRoles = await this.userService.findById(user.userId);
    
    if (!userWithRoles) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!userWithRoles.roles || !Array.isArray(userWithRoles.roles)) {
      throw new UnauthorizedException('用户角色信息不完整');
    }

    const permissions = new Set<string>();

    userWithRoles.roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(permission => {
          if (permission && permission.code) {
            permissions.add(permission.code);
          }
        });
      }
    });

    if (permissions.size === 0) {
      throw new UnauthorizedException('用户没有任何权限');
    }

    // console.log('requiredPermissions', requiredPermissions);
    // console.log('user permissions', permissions);

    return requiredPermissions.some(permission => permissions.has(permission));
  }
}