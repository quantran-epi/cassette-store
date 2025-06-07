export const CUSTOMER_AREAS = ["Nội tỉnh", "Giáp ranh", "Miền bắc", "Miền trung", "Nam trung bộ", "Miền nam"];
export const CUSTOMER_DIFFUCULTIES = ["Dễ", "Trung bình", "Khó"];
export const CUSTOMER_PROVINCES = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn",
    "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước",
    "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk",
    "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
    "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang",
    "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
    "Lạng Sơn", "Lào Cai", "Lâm Đồng", "Long An", "Nam Định", "Nghệ An",
    "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam",
    "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh",
    "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang",
    "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc",
    "Yên Bái"
];

export const ORDER_RETURN_REASON = {
    REFUSE_TO_RECEIVE: "T",
    BROKEN_ITEMS: "BROKEN_ITEMS"
}

export const ORDER_PAYMENT_METHOD = {
    CASH_COD: "COD",
    BANK_TRANSFER_IN_ADVANCE: "Chuyển khoản trước",
    BANK_TRANSFER_COD: "Chuyển khoản khi nhận hàng"
}

export const ORDER_SHIPPING_PARTNER = {
    VNPOST: "VNPost",
    VIETTEL_POST: "Viettel Post"
}

export const ORDER_STATUS = {
    PLACED: "Chưa vận chuyển",
    SHIPPED: "Đã giao thành công",
    WAITING_FOR_RETURNED: "Chờ chuyển hoàn",
    RETURNED: "Đã chuyển hoàn",
}

export const ORDER_DEFAULT_SHIPPING_COST = 20520;

export const ORDER_PRIORITY_STATUS = {
    NONE:"Bình thường",
    PRIORITY: "Ưu tiên làm trước",
    URGENT: "Gấp"
}

export const ORDER_ITEM_TYPE  = {
    SONY: "Sony",
    MAXELL: "Maxell"
}

export const ORDER_ITEM_UNIT_PRICE  = {
    "50K": 50000,
    "70K": 70000,
    "80K": 80000,
    "100K": 100000,
    "120K": 120000,
    "140K": 140000,
    "200K": 200000
}

export const COLORS = {
    CUSTOMER: {
        VIP: "#FFD700",
        BLACK_LIST: "#FF0000",
        CONFIRMED: "#1877F2"
    }
}