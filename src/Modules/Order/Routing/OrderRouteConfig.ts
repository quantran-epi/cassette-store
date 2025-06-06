import { RouteHelpers } from "@common/Helpers/RouteHelper"

const CustomerRoutes = RouteHelpers.CreateRoutes('/order', (orderRoot) => ({
    List: () => RouteHelpers.CreateRoute(orderRoot, ["list"]),
    Create: () => RouteHelpers.CreateRoute(orderRoot, ["create"])
}))

export default CustomerRoutes