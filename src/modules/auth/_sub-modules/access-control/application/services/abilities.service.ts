import { Injectable } from "@nestjs/common";
import { AuthAbilityFactory } from "../factories/auth-ability.factory";
import { Action, AppAbility, Subjects } from "../../domain/types";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";

export interface AuthAbilitiesService {
    createAbilityForUser(user: UserResponsePayload): AppAbility
    createAbilityForUser(user: UserEntity): AppAbility

    canUserPerformAction(user: UserResponsePayload, action: Action, subject: Subjects | any): boolean
    canUserPerformAction(user: UserEntity, action: Action, subject: Subjects | any): boolean

    filterAllowedFields(user: UserResponsePayload, subject: any, fields: string[]): string[]
    filterAllowedFields(user: UserEntity, subject: any, fields: string[]): string[]
}

@Injectable()
export class CaslAbilitiesService implements AuthAbilitiesService {
    constructor(private caslAbilityFactory: AuthAbilityFactory) { }

    createAbilityForUser(user: UserEntity): AppAbility {
        return this.caslAbilityFactory.createForUser(user);
    }

    canUserPerformAction(user: UserEntity, action: Action, subject: Subjects | any): boolean {
        const ability = this.createAbilityForUser(user);
        return ability.can(action, subject);
    }

    filterAllowedFields(user: UserEntity, subject: any, fields: string[]): string[] {
        const ability = this.createAbilityForUser(user);
        // This is a simplified version - you might want to implement more sophisticated field-level permissions
        return fields.filter(field => ability.can(Action.Read, subject));
    }
}