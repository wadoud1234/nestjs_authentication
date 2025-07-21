import { UserRole } from "../enums/user-role.enum";

export class UserEntity {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public password: string,
        public role: UserRole,
        public bio: string
    ) { }
}