import * as booksModuleTables from "./books"
import * as commerceModuleTables from "./commerce"
import * as identityModuleTables from "./identity"
import * as userEngagementModuleTables from "./user-engagement"

const schema = {
    ...booksModuleTables,
    ...commerceModuleTables,
    ...identityModuleTables,
    ...userEngagementModuleTables
}

export default schema;