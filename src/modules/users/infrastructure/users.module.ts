import { Module } from "@nestjs/common";
import UsersController from "../presentation/controllers/users.controller";
import { UsersRepositoryProvider } from "./repositories/users.repository";

@Module({
    providers: [UsersRepositoryProvider],
    controllers: [UsersController],
    exports: [UsersRepositoryProvider]
})
export class UsersModule { }