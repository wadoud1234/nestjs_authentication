import { isValidEmail, IsValidPassword } from "./_shared.request";

export class LoginRequestBody {
    @isValidEmail()
    email: string

    @IsValidPassword()
    password: string
}