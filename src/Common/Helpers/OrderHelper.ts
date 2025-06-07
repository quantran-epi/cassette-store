import { ORDER_ITEM_TYPE, ORDER_ITEM_UNIT_PRICE } from "@common/Constants/AppConstants"
import { Order } from "@store/Models/Order"
import { OrderItem } from "@store/Models/OrderItem"
import { nanoid } from "nanoid"

export const OrderHelper = {
    createNewEmptyOrderItem: (orderName: string, defaultCount: number = 5, defaultType: string = ORDER_ITEM_TYPE.SONY, defaultPrice: number = ORDER_ITEM_UNIT_PRICE["50K"]):OrderItem => {
        return {
            id: orderName + nanoid(5),
            count: defaultCount,
            type: defaultType,
            unitPrice: defaultPrice,
            note: ""
        }
    }
}