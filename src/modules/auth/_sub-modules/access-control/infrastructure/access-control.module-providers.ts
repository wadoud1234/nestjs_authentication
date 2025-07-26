import { Provider } from "@nestjs/common";
import { BaseResourceGuard } from "../presentation/guards/base-resource.guard";
import { AbilitiesGuard } from "../presentation/guards/abilities.guard";
import { AbilitiesResourceGuard } from "../presentation/guards/abilities-resource.guard";

export const AccessControlModuleService: Provider[] = [

]

export const AccessControlModuleFactories: Provider[] = [

]

export const AccessControlModuleGuards: Provider[] = [
    AbilitiesGuard,
    AbilitiesResourceGuard
]