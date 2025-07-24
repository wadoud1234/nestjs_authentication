import { Module } from "@nestjs/common";
import { SessionsModuleGuards, SessionsModuleMiddlewares, SessionsModuleServices, SessionsModuleStrategies } from "./sessions.module-providers";
import { SessionsController } from "../presentation/sessions.controller";

@Module({
    imports: [],
    controllers: [SessionsController],
    providers: [
        ...SessionsModuleGuards,
        ...SessionsModuleServices,
        ...SessionsModuleStrategies,
        ...SessionsModuleMiddlewares
    ],
    exports: [
        ...SessionsModuleGuards,
        ...SessionsModuleServices,
        ...SessionsModuleStrategies,
        ...SessionsModuleMiddlewares
    ]
})
export class SessionsModule { }