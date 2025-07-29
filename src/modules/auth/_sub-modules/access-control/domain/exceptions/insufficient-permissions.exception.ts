import { UnauthorizedException } from "@nestjs/common"

export class YouDontHaveSufficientPermissionsExcpetion extends UnauthorizedException {
    constructor(message: string = "You dont have sufficient permissions to perform this action !") {
        super(message)
    }
}