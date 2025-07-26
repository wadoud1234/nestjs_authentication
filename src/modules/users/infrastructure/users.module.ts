import { Module } from "@nestjs/common";
import { UsersQueriesController } from "../presentation/controllers/users.queries-controller";
import { UsersCommandsController } from "../presentation/controllers/users.commands-controller";

@Module({
    providers: [],
    controllers: [
        UsersQueriesController,
        UsersCommandsController
    ],
    exports: []
})
export class UsersModule { }