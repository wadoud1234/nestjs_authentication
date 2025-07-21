import { applyDecorators } from "@nestjs/common";
import { IsEmail, IsNotEmpty, isString, IsString, IsStrongPassword, minLength, ValidationArguments } from "class-validator";

export function IsValidPassword() {
    const PASSWORD_MIN_LENGTH = 14;
    const PASSWORD_MIN_LOWERCASE = 1;
    const PASSWORD_MIN_UPPERCASE = 1;
    const PASSWORD_MIN_NUMBERS = 1;
    const PASSWORD_MIN_SYMBOLS = 1;

    return applyDecorators(
        IsStrongPassword({
            minLength: PASSWORD_MIN_LENGTH,
            minLowercase: PASSWORD_MIN_LOWERCASE,
            minUppercase: PASSWORD_MIN_UPPERCASE,
            minNumbers: PASSWORD_MIN_NUMBERS,
            minSymbols: PASSWORD_MIN_SYMBOLS
        }, {
            message(validationArguments: ValidationArguments) {
                const value = validationArguments.value;

                // Check if value is not a string
                if (typeof value !== 'string') {
                    return 'Password must be a string';
                }

                // Check minimum length
                if (value.length < PASSWORD_MIN_LENGTH) {
                    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
                }

                // Check for lowercase letters
                if (!/[a-z]/.test(value)) {
                    return `Password must contain at least ${PASSWORD_MIN_LOWERCASE} lowercase letter${PASSWORD_MIN_LOWERCASE > 1 ? 's' : ''}`;
                }

                // Check for uppercase letters
                if (!/[A-Z]/.test(value)) {
                    return `Password must contain at least ${PASSWORD_MIN_UPPERCASE} uppercase letter${PASSWORD_MIN_UPPERCASE > 1 ? 's' : ''}`;
                }

                // Check for numbers
                if (!/[0-9]/.test(value)) {
                    return `Password must contain at least ${PASSWORD_MIN_NUMBERS} number${PASSWORD_MIN_NUMBERS > 1 ? 's' : ''}`;
                }

                // Check for symbols (special characters)
                // class-validator considers these as symbols: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
                if (!/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(value)) {
                    return `Password must contain at least ${PASSWORD_MIN_SYMBOLS} special character${PASSWORD_MIN_SYMBOLS > 1 ? 's' : ''} (e.g., !@#$%^&*)`;
                }

                // Default fallback message (should not reach here if all checks pass)
                return 'Password does not meet strength requirements';
            },
        })
    );
}

export function isValidEmail() {
    return applyDecorators(
        IsEmail({}, { message: "Invalid Email" })
    )
}