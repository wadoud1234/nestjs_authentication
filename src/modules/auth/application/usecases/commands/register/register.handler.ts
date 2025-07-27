import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPasswordHasher, PasswordHasher, } from '@/modules/auth/application/services/password-hasher.service';
import { EmailAlreadyUsed } from '@/modules/auth/domain/exceptions/user-already-exists.exception';
import { RegisterCommand } from './register.command';
import { RegisterCommandResult } from './register.result';
import { Provider } from '@nestjs/common';
import { usersTable } from '@/shared/infrastructure/database/schema/users.table';
import { eq } from 'drizzle-orm';
import { InjectUsersRepository, UsersRepository } from '@/modules/users/infrastructure/repositories/users.repository';

export interface RegisterCommandHandler extends ICommandHandler<RegisterCommand> { }

@CommandHandler(RegisterCommand)
export class RegisterCommandHandlerImpl implements RegisterCommandHandler {
  constructor(
    @InjectPasswordHasher() private readonly passwordHasher: PasswordHasher,
    @InjectUsersRepository() private readonly usersRepository: UsersRepository
  ) { }

  async execute({ name, email, password }: RegisterCommand): Promise<RegisterCommandResult> {
    await this.verifyUserDoesntExist(email);

    const hashedPassword = await this.passwordHasher.hash(password);

    const newUser = this.usersRepository.createUser({
      name,
      email,
      password: hashedPassword
    })

    return newUser;
  }

  private async verifyUserDoesntExist(email: string) {
    const isUserExist = await this.usersRepository.isUserExistByWhere(eq(usersTable.email, email))

    if (isUserExist) throw new EmailAlreadyUsed();
    return;
  }
}

export const RegisterCommandHandlerToken = Symbol('RegisterCommandHandler');

export const RegisterCommandHandlerProvider: Provider = {
  provide: RegisterCommandHandlerToken,
  useClass: RegisterCommandHandlerImpl,
};
