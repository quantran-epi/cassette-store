import CustomerRoutes from '@modules/Customer/Routing/CustomerRouteConfig';
import OrderRoutes from '@modules/Order/Routing/OrderRouteConfig';

const AuthorizedRoutes = {
    Root: () => "/",
    CustomerRoutes,
    OrderRoutes
}

export const RootRoutes = {
    AuthorizedRoutes,
    StaticRoutes: {
        Error: '/error',
        NotFound: '*',
        Unauthorized: "/unauthorized"
    }
}