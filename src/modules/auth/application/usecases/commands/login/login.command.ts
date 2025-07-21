import { Command } from "@nestjs/cqrs";
import { LoginCommandResult } from "./login.result";
import { LoginRequestBody } from "@/modules/auth/presentation/contracts/requests/login.request";

export class LoginCommand extends Command<LoginCommandResult> {
    constructor(
        public readonly email: string,
        public readonly password: string
    ) {
        super();
    }

    static from(body: LoginRequestBody): LoginCommand {
        return new LoginCommand(body.email, body.password)
    }
}