import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Inject, Ip, Post, Req, Res, Session } from "@nestjs/common";
import { LoginRequestBody } from "../contracts/requests/login.request";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AuthResponse } from "../contracts/responses/auth.response";
import { UserRole } from "@/modules/users/domain/enums/user-role.enum";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { DatabaseService, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { LoginCommand } from "../../application/usecases/commands/login/login.command";
import { RegisterRequestBody } from "../contracts/requests/register.request";
import { RegisterCommand } from "../../application/usecases/commands/register/register.command";
import { UserResponse, UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";
import { Public } from "../decorators/is-public.decorator";
import { CurrentUser } from "../decorators/current-user.decorator";
import { GetSessionQuery } from "../../application/usecases/queries/get-session/get-session.query";
import { FastifySessionObject } from "@fastify/session"
import { InjectSessionManager, SessionManagerService } from "../../_sub-modules/sessions/application/services/session-manager.session";
import { FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";

@Controller("/auth")
export class AuthController {

    constructor(
        @InjectDatabase() private readonly db: DatabaseService,
        @InjectSessionManager() private readonly sessionManager: SessionManagerService,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Public()
    @Get()
    async hello() {
        // await this.db.update(usersTable).set({
        //     role: UserRole.ADMIN
        // }).where(eq(usersTable.email, "abdelouadoud12@email.com"))
        return { data: await this.db.select().from(usersTable) }
    }

    @Get("/session")
    async getSession(@CurrentUser() user: UserResponsePayload): Promise<UserResponse> {
        const session = await this.queryBus.execute(new GetSessionQuery(user.id))
        return {
            data: session
        }
    }

    @Public()
    @Delete()
    async deleteAll() {
        await this.db.delete(usersTable);
        return {
            data: "HELLO WORLD"
        }
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("/login")
    async login(
        @Body() body: LoginRequestBody,
        @Session() session: FastifySessionObject,
        @Ip() ip: string,
        @Req() request: FastifyRequest
    ): Promise<UserResponse> {
        const data = await this.commandBus.execute(LoginCommand.from(body))

        // Store user in session
        session.set("user", data);

        // Track the active session
        await this.sessionManager.trackActiveSession(session.sessionId, {
            userId: data.id,
            username: data.name,
            role: data.role,
            ipAddress: ip,
            userAgent: request.headers['user-agent']
        });

        return {
            message: "Login Success",
            data
        }
    }

    @Post("/logout")
    @HttpCode(HttpStatus.OK)
    async logout(@Session() session: FastifySessionObject): Promise<{ message: string }> {
        // Remove from active sessions tracking
        await this.sessionManager.removeActiveSession(session.sessionId);

        // Destroy the session
        await session.destroy();

        return {
            message: "Logout Success"
        };
    }

    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post("/register")
    async register(@Body() body: RegisterRequestBody): Promise<UserResponse> {
        const user = await this.commandBus.execute(RegisterCommand.from(body))
        return {
            message: "Register Success",
            data: user
        }
    }
}