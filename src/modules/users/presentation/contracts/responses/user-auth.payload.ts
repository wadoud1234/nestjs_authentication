import { UserRole } from "@/modules/users/domain/enums/user-role.enum"

export class UserAuthPayload {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly roles: UserRole[],
        public readonly permissions: string[],
    ) { }

}