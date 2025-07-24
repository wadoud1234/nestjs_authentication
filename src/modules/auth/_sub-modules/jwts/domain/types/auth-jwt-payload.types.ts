import { UserRole } from "@/modules/users/domain/enums/user-role.enum";

export class AuthJwtPayload {
    constructor(
        public readonly sub: string,
        public readonly email: string,
        public readonly name: string,
        public readonly role: UserRole
    ) { }
}