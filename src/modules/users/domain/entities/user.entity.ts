import { UserRole } from "../enums/user-role.enum";

export class UserEntity {
    id: string
    name: string
    email: string
    password: string
    bio: string
    roles: UserRole[]
    permissions: string[]
    lastConnection: Date | null
    createdAt: Date
    updatedAt: Date | null
    deletedAt: Date | null
}