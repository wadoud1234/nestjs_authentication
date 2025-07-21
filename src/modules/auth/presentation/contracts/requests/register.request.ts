import { isValidUsername } from "@/modules/users/presentation/contracts/requests/_shared.request";
import { isValidEmail, IsValidPassword } from "./_shared.request";

export class RegisterRequestBody {
    @isValidUsername()
    name: string

    @isValidEmail()
    email: string

    @IsValidPassword()
    password: string
}