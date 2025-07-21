import { Module } from "@nestjs/common";
import { AuthController } from "../presentation/controllers/auth.controller";
import { UsersModule } from "@/modules/users/infrastructure/users.module";
import { AuthCommandHandlers, AuthQueryHandlers, AuthServices } from "./auth.module-providers";

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [
        ...AuthCommandHandlers,
        ...AuthQueryHandlers,
        ...AuthServices
    ]
})
export class AuthModule { }