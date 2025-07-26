import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  InjectPasswordHasher,
  PasswordHasher,
} from '@/modules/auth/application/services/password-hasher.service';
import { EmailAlreadyUsed } from '@/modules/auth/domain/exceptions/user-already-exists.exception';
import { RegisterCommand } from './register.command';
import { RegisterCommandResult } from './register.result';
import { Provider } from '@nestjs/common';
import {
  Database,
  InjectDatabase,
} from '@/shared/infrastructure/database/database.module';
import { usersTable } from '@/shared/infrastructure/database/schema/users.table';
import { eq } from 'drizzle-orm';

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler
  implements ICommandHandler<RegisterCommand> {
  constructor(
    @InjectPasswordHasher() private readonly passwordHasher: PasswordHasher,
    @InjectDatabase() private readonly database: Database,
  ) { }

  async execute({
    name,
    email,
    password,
  }: RegisterCommand): Promise<RegisterCommandResult> {
    await this.verifyUserDoesntExist(email);

    const hashedPassword = await this.passwordHasher.hash(password);

    const [newUser] = await this.database
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        role: usersTable.role
      })

    return newUser;
  }

  private async verifyUserDoesntExist(email: string) {
    const [isUserExist] = await this.database
      .select({
        id: usersTable.id,
        email: usersTable.email
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!isUserExist || !isUserExist.email || !isUserExist.id) return;
    throw new EmailAlreadyUsed();
  }
}

export const RegisterCommandHandlerToken = Symbol('RegisterCommandHandler');

export const RegisterCommandHandlerProvider: Provider = {
  provide: RegisterCommandHandlerToken,
  useClass: RegisterCommandHandler,
};
