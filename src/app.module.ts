import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/infrastructure/auth.module";
import { UsersModule } from "src/modules/users/infrastructure/users.module";
import { InfrastructureModule } from "./shared/infrastructure/infrastructure.module";

@Module({
    imports: [InfrastructureModule, AuthModule, UsersModule]
})
export class AppModule { }