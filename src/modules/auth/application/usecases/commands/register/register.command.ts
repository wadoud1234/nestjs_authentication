import { RegisterRequestBody } from "@/modules/auth/presentation/contracts/requests/register.request";
import { Command } from "@nestjs/cqrs";
import { RegisterCommandResult } from "./register.result";

export class RegisterCommand extends Command<RegisterCommandResult> {
    constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly password: string
    ) {
        super();
    }

    static from(body: RegisterRequestBody): RegisterCommand {
        return new RegisterCommand(body.name, body.email, body.password)
    }
}