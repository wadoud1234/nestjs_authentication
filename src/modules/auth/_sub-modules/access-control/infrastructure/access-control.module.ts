import { Module } from "@nestjs/common";
import { AccessControlModuleService, AccessControlModuleFactories, AccessControlModuleGuards } from "./access-control.module-providers";

@Module({
    imports: [],
    providers: [
        ...AccessControlModuleService,
        ...AccessControlModuleFactories,
        ...AccessControlModuleGuards
    ],
    exports: [
        ...AccessControlModuleService,
        ...AccessControlModuleFactories,
        ...AccessControlModuleGuards
    ]
})
export class AccessControlModule { }