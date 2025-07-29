import { Provider } from "@nestjs/common";
import { PermissionGuard } from "../presentation/guards/permissions.guard";

export const AccessControlModuleService: Provider[] = [

]

export const AccessControlModuleFactories: Provider[] = [

]

export const AccessControlModuleGuards: Provider[] = [
    PermissionGuard
]