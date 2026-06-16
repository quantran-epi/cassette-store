import {Button} from "@components/Button";
import {Stack} from "@components/Layout/Stack";
import {Typography} from "@components/Typography";
import {Customer} from "@store/Models/Customer";
import React, {FunctionComponent} from "react";

type OrderSelectedCustomerSummaryWidgetProps = {
    customer: Customer;
    onChangeCustomer: () => void;
}

export const OrderSelectedCustomerSummaryWidget: FunctionComponent<OrderSelectedCustomerSummaryWidgetProps> = ({
    customer,
    onChangeCustomer
}) => {
    return <div data-testid="selected-customer-summary" style={{
        padding: 8,
        border: "1px solid #d9d9d9",
        borderRadius: 4,
        backgroundColor: "#f5f5f5"
    }}>
        <Stack fullwidth justify="space-between" align="flex-start">
            <Stack direction="column" gap={4} align="flex-start">
                <Typography.Text strong>{customer.name}</Typography.Text>
                <Typography.Text type="secondary" style={{fontSize: 14}}>{customer.mobile}</Typography.Text>
                <Typography.Text type="secondary" style={{fontSize: 14}}>
                    {[customer.province, customer.address].filter(Boolean).join(" - ")}
                </Typography.Text>
            </Stack>
            <Button size="small" onClick={onChangeCustomer}>Đổi khách</Button>
        </Stack>
    </div>
}
