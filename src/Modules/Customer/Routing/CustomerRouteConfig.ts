import { RouteHelpers } from "@common/Helpers/RouteHelper"

const CustomerRoutes = RouteHelpers.CreateRoutes('/customer', (customerRoot) => ({
    List: () => RouteHelpers.CreateRoute(customerRoot, ["list"])
}))

export default CustomerRoutes