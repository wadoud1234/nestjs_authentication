import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/modules/users/domain/enums/user-role.enum'; // Assuming your enum path

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);