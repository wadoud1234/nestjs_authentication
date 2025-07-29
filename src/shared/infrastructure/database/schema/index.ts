import * as addresses from "./addresses.table"
import * as booksCategoriesJoin from "./books_categories.table"
import * as books from "./books.table"
import * as cartItems from "./cart-items.table"
import * as carts from "./carts.table"
import * as categories from "./categories.table"
import * as orderItems from "./order-items.table"
import * as orders from "./orders.table"
import * as refreshTokens from "./refresh_tokens.table"
import * as reviews from "./reviews.table"
import * as users from "./users.table";
import * as wishlistItems from "./wishlist-items.table"

const schema = {
    ...addresses,
    ...booksCategoriesJoin,
    ...books,
    ...cartItems,
    ...carts,
    ...categories,
    ...orderItems,
    ...orders,
    ...refreshTokens,
    ...reviews,
    ...users,
    ...wishlistItems
}

export default schema