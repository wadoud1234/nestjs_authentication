import { UserRole } from "@/modules/users/domain/enums/user-role.enum";
import { SuccessResponsePayload } from "@/shared/presentation/contracts/responses/success.response";

export class UserResponsePayload {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly role: UserRole
    ) { }
}

export class UserResponse extends SuccessResponsePayload<UserResponsePayload> { }

export const userResponseDatabaseReturning = {
    id: true,
    name: true,
    email: true,
    role: true
}