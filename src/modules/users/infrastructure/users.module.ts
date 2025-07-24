import { Module } from "@nestjs/common";
import UsersController from "../presentation/controllers/users.controller";

@Module({
    providers: [],
    controllers: [UsersController],
    exports: []
})
export class UsersModule { }