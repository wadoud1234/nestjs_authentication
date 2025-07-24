import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtsModuleGuards, JwtsModuleServices, JwtsModuleStrategies } from "./jwts.module-providers";

@Module({
    imports: [
        JwtModule.register({
            global: true,
        }),
    ],
    providers: [
        ...JwtsModuleStrategies,
        ...JwtsModuleGuards,
        ...JwtsModuleServices
    ],
    exports: [
        ...JwtsModuleStrategies,
        ...JwtsModuleGuards,
        ...JwtsModuleServices
    ]
})
export class JwtsModule { }