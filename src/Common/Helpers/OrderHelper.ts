import { ORDER_ITEM_TYPE } from "@common/Constants/AppConstants"
import { Order } from "@store/Models/Order"
import { OrderItem } from "@store/Models/OrderItem"
import { nanoid } from "nanoid"

export const OrderHelper = {
    createNewEmptyOrderItem: (orderName: string, useDefault: boolean, defaultCount: number = 5, defaultType: string = Object.keys(ORDER_ITEM_TYPE)[0], defaultPrice: number = ORDER_ITEM_TYPE["SONY-50K"]): OrderItem => {
        if (useDefault)
            return {
                id: orderName + nanoid(5),
                count: defaultCount,
                type: defaultType,
                unitPrice: defaultPrice,
                note: ""
            }
        return {
            id: orderName + nanoid(5),
            count: 0,
            type: undefined,
            unitPrice: null,
            note: ""
        }
    }
}