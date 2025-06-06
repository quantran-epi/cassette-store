import CustomerRoutes from '@modules/Customer/Routing/CustomerRouteConfig';

const AuthorizedRoutes = {
    Root: () => "/",
    CustomerRoutes,
}

export const RootRoutes = {
    AuthorizedRoutes,
    StaticRoutes: {
        Error: '/error',
        NotFound: '*',
        Unauthorized: "/unauthorized"
    }
}