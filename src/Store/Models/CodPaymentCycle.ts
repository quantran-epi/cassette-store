export type CodPaymentCycle = {
    id: string;
    name: string;
    cycleDate: string; // ISO
    paymentOrders: string[];
    debitFeeOrders: string[];
}