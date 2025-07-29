import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPasswordHasher, PasswordHasher, } from '@/modules/auth/application/services/password-hasher.service';
import { EmailAlreadyUsed } from '@/modules/auth/domain/exceptions/user-already-exists.exception';
import { RegisterCommand } from './register.command';
import { RegisterCommandResult } from './register.result';
import { ConflictException, Provider } from '@nestjs/common';
import { usersTable } from '@/shared/infrastructure/database/schema/identity/users.table';
import { eq } from 'drizzle-orm';
import { InjectUsersRepository, UsersRepository } from '@/modules/users/infrastructure/repositories/users.repository';
import { UserRole } from '@/modules/users/domain/enums/user-role.enum';
import { InjectUserRolesRepository, UserRolesRepository } from '@/modules/users/infrastructure/repositories/user-roles.repository';
import { Database, InjectDatabase } from '@/shared/infrastructure/database/database.module';
import { DatabaseTransaction } from '@/shared/infrastructure/database/providers/transaction-manager.provider';

export interface RegisterCommandHandler extends ICommandHandler<RegisterCommand> { }

@CommandHandler(RegisterCommand)
export class RegisterCommandHandlerImpl implements RegisterCommandHandler {
  constructor(
    @InjectPasswordHasher() private readonly passwordHasher: PasswordHasher,
    @InjectUsersRepository() private readonly usersRepository: UsersRepository,
    @InjectUserRolesRepository() private readonly userRolesRepository: UserRolesRepository,
    @InjectDatabase() private readonly database: Database
  ) { }

  async execute({ name, email, password }: RegisterCommand): Promise<RegisterCommandResult> {

    const user = await this.database.transaction(async (tx) => {
      await this.verifyUserDoesntExist(email, tx);

      const hashedPassword = await this.passwordHasher.hash(password);

      const { id: newUserId } = await this.usersRepository.createUser({
        name,
        email,
        password: hashedPassword
      }, tx)

      const roleId = await this.userRolesRepository.getRoleId(UserRole.USER, tx);

      await this.userRolesRepository.addRoleToUser(newUserId, roleId, tx);

      const newUser = await this.usersRepository.findUserByWhereAsUserResponse(eq(usersTable.id, newUserId), tx)

      if (!newUser) {
        throw new ConflictException("I am sure it exists");
      }

      return newUser;
    })

    return user
  }

  private async verifyUserDoesntExist(email: string, tx: DatabaseTransaction) {
    const isUserExist = await this.usersRepository.isUserExistByWhere(eq(usersTable.email, email), tx)

    if (isUserExist) throw new EmailAlreadyUsed();
    return;
  }
}

export const RegisterCommandHandlerToken = Symbol('RegisterCommandHandler');

export const RegisterCommandHandlerProvider: Provider = {
  provide: RegisterCommandHandlerToken,
  useClass: RegisterCommandHandlerImpl,
};
