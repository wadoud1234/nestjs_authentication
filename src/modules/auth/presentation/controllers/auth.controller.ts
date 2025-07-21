import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from "@nestjs/common";
import { LoginRequestBody } from "../contracts/requests/login.request";
import { CommandBus } from "@nestjs/cqrs";
import { LoginCommand, LoginCommandResult } from "../../application/usecases/commands/login/login.handler";
import { AuthResponse } from "../contracts/responses/auth.response";
import { UserRole } from "@/modules/users/domain/enums/user-role.enum";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { DatabaseService, InjectDatabase } from "@/shared/infrastructure/database/database.module";

@Controller("/auth")
export class AuthController {

    constructor(
        @InjectDatabase() private readonly db: DatabaseService,
        private readonly commandBus: CommandBus
    ) {
    }

    @Get()
    async hello() {
        return { data: await this.db.select().from(usersTable) }
    }

    @HttpCode(HttpStatus.OK)
    @Post("/login")
    async login(@Body() body: LoginRequestBody): Promise<AuthResponse> {
        const { name } = await this.commandBus.execute(LoginCommand.from(body))
        console.log({ name })
        return {
            message: "Login Success",
            data: {
                user: {
                    email: body.email,
                    id: "",
                    name,
                    role: UserRole.USER
                },
                tokens: {
                    accessToken: "accessToken",
                    refreshToken: "refreshToken"
                }
            },
        }
    }
}