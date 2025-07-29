import { Body, Controller, HttpCode, HttpStatus, Ip, Post, Req, Session } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { LoginRequestBody } from "../contracts/requests/login.request";
import { FastifySessionObject } from "@fastify/session";
import { Public } from "../decorators/is-public.decorator";
import { UserResponse } from "@/modules/users/presentation/contracts/responses/user.response";
import { CommandBus } from "@nestjs/cqrs";
import { LoginCommand } from "../../application/usecases/commands/login/login.command";
import { InjectSessionManager, SessionManagerService } from "../../_sub-modules/sessions/application/services/session-manager.session";
import { RegisterRequestBody } from "../contracts/requests/register.request";
import { RegisterCommand } from "../../application/usecases/commands/register/register.command";

@Controller("auth")
export class AuthCommandsController {

    constructor(
        @InjectSessionManager() private readonly sessionManager: SessionManagerService,
        private readonly commandBus: CommandBus,
    ) { }

    // LOGIN USER WITH HIS CREDENTIALS (EMAIL - PASSWORD)
    // AND SAVE HIS SESSION (NEW SESSION)

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("/login")
    async login(
        @Body() body: LoginRequestBody,
        @Session() session: FastifySessionObject,
        @Ip() ip: string,
        @Req() request: FastifyRequest
    ): Promise<UserResponse> {
        const user = await this.commandBus.execute(LoginCommand.from(body))
        // Store user in session
        session.set("user", {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            permissions: user.permissions
        });

        // Track the active session
        await this.sessionManager.trackActiveSession(session.sessionId, {
            userId: user.id,
            username: user.name,
            roles: user.roles,
            permissions: user.permissions,
            ipAddress: ip,
            userAgent: request.headers['user-agent']
        });

        const { permissions, ...properties } = user

        return {
            message: "Login Success",
            data: properties
        }
    }

    // REGISTER NEW USER WITH HIS CREDENTIALS (NAME - EMAIL - PASSWORD)

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

    // LOGOUT USER AND DELETE HIS SESSION

    @Post("logout")
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


}