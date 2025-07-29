import { CartItemEntity } from "./cart-item.entity"

export class CartEntity {
    id: string
    userId: string
    items: CartItemEntity[]
}