import {
    BrowserRouter, Route, Routes
} from "react-router-dom";
import { RootRoutes } from "./RootRoutes";
import { CustomerRouter } from "@modules/Customer/Routing/CustomerRouter";
import { CustomerListScreen } from "@modules/Customer/Screens/CustomerList.screen";
import { MasterPage } from "./MasterPage";
import {DashboardScreen} from "@modules/Home/Screens/Dashboard.screen";
import {OrderCreateScreen} from "@modules/Order/Screens/OrderCreate/OrderCreate.screen";
import {OrderListScreen} from "@modules/Order/Screens/OrderList.screen";
import {OrderCodPaymentListScreen} from "@modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen";

export const RootRouter = () => {
    return <BrowserRouter basename="/cassette-store">
        <Routes>
            <Route path={RootRoutes.AuthorizedRoutes.Root()} element={<MasterPage />}>
                <Route index element={<DashboardScreen />} />
                <Route path={RootRoutes.AuthorizedRoutes.OrderRoutes.Root()} element={<CustomerRouter />}>
                    <Route path={RootRoutes.AuthorizedRoutes.OrderRoutes.List()} element={<OrderListScreen />} />
                    <Route path={RootRoutes.AuthorizedRoutes.OrderRoutes.Create()} element={<OrderCreateScreen />} />
                    <Route path={RootRoutes.AuthorizedRoutes.OrderRoutes.CodPaymentList()} element={<OrderCodPaymentListScreen />} />
                </Route>
                <Route path={RootRoutes.AuthorizedRoutes.CustomerRoutes.Root()} element={<CustomerRouter />}>
                    <Route path={RootRoutes.AuthorizedRoutes.CustomerRoutes.List()} element={<CustomerListScreen />} />
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
}