import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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

    if (!user) {
      return false;
    }

    const userWithRoles = await this.userService.findById(user.userId);
    const permissions = new Set<string>();

    userWithRoles.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissions.add(permission.code);
      });
    });

    return requiredPermissions.some(permission => permissions.has(permission));
  }
}