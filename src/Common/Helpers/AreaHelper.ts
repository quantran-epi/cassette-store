import {CUSTOMER_AREAS} from "@common/Constants/AppConstants";

export const AreaHelpers = {
    neighborOfHY: ["Hà Nội", "Hà Nam", "Thái Bình", "Hải Dương"],
    north: [
        "Cao Bằng",
        "Bắc Kạn",
        "Lạng Sơn",
        "Hà Giang",
        "Tuyên Quang",
        "Thái Nguyên",
        "Phú Thọ",
        "Yên Bái",
        "Lào Cai",
        "Điện Biên",
        "Lai Châu",
        "Sơn La",
        "Hòa Bình",
        "Ninh Bình",
        "Nam Định",
        "Quảng Ninh",
        "Bắc Giang",
        "Bắc Ninh",
        "Vĩnh Phúc",
        "Hải Phòng"
    ],
    middles: [
        "Thanh Hóa",
        "Nghệ An",
        "Hà Tĩnh",
        "Quảng Bình",
        "Quảng Trị",
        "Thừa Thiên Huế"
    ],
    middleSouth: [
        "Đà Nẵng",
        "Quảng Nam",
        "Quảng Ngãi",
        "Bình Định",
        "Phú Yên",
        "Khánh Hòa",
        "Ninh Thuận",
        "Bình Thuận"
    ],
    south: [
        // Đông Nam Bộ
        "TP. Hồ Chí Minh",
        "Bà Rịa - Vũng Tàu",
        "Bình Dương",
        "Bình Phước",
        "Đồng Nai",
        "Tây Ninh",

        // Tây Nam Bộ (Đồng bằng sông Cửu Long)
        "An Giang",
        "Bạc Liêu",
        "Bến Tre",
        "Cà Mau",
        "Cần Thơ",
        "Đồng Tháp",
        "Hậu Giang",
        "Kiên Giang",
        "Long An",
        "Sóc Trăng",
        "Tiền Giang",
        "Trà Vinh",
        "Vĩnh Long"
    ],
    parseAreaFromProvince: (province: string): string => {
        if (province == "Hưng Yên") return CUSTOMER_AREAS[0];
        if (AreaHelpers.neighborOfHY.includes(province)) return CUSTOMER_AREAS[1];
        if (AreaHelpers.north.includes(province)) return CUSTOMER_AREAS[2];
        if (AreaHelpers.middles.includes(province)) return CUSTOMER_AREAS[3];
        if (AreaHelpers.middleSouth.includes(province)) return CUSTOMER_AREAS[4];
        if (AreaHelpers.south.includes(province)) return CUSTOMER_AREAS[5];
        return "";
    }
}