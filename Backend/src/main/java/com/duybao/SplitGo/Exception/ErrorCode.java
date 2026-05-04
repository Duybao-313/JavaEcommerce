package com.duybao.SplitGo.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND(1000, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(1001, "ROLE không tồn tại", HttpStatus.NOT_FOUND),
    USERNAME_ALREADY_EXISTS(1002, "Tài khoản đã tồn tại", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(1003, "Email đã được sử dụng", HttpStatus.BAD_REQUEST),
    WALLET_NOT_FOUND(1004, "Không tìm thấy ví", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(1005, "Không tìm thấy danh mục", HttpStatus.NOT_FOUND),
    WALLET_NOT_ENOUGH(1006, "Số dư không đủ", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1007, "Không có quyền", HttpStatus.FORBIDDEN),
    BUDGET_NOT_FOUND(1008, "Không tìm thấy budget", HttpStatus.NOT_FOUND),
    TRANSACTION_NOT_FOUND(1009, "Không tìm thấy giao dịch", HttpStatus.NOT_FOUND),
    PASSWORD_INCORRECT(1010, "Mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1011, "Token hết hạn", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID(1012, "Token không hợp lệ", HttpStatus.UNAUTHORIZED),
    INTERNAL_ERROR(1013, "Lỗi nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_EXIST(1014, "Danh mục đã tồn tại", HttpStatus.BAD_REQUEST),
    CATEGORY_ALREADY_ASSIGNED(1015, "Đã gán danh mục này", HttpStatus.CONFLICT),
    AMOUNT_NOT_NEGATIVE(1016, "Số tiền phải >0", HttpStatus.BAD_REQUEST),
    READ_FILE_ERROR(1017, "Lỗi khi đọc file", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST(1018, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    USERNAME_NOT_NULL(1019, "Tài khoản không được để trống", HttpStatus.BAD_REQUEST),
    USERNAME_TOO_SHORT(1020, "Tài khoản PHẢI NHIỀU HƠN 3 KÝ TỰ", HttpStatus.BAD_REQUEST),
    NAME_NOT_NULL(1021, "TÊN KHÔNG ĐƯỢC ĐỂ TRỐNG", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_NULL(1022, "Mật khẩu không đưuọc để trống", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_SHORT(1023, "Mật khẩu phải trên 6 ký tự", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1024, "Email không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_USERNAME(1024, "Tài khoản không hợp lệ", HttpStatus.BAD_REQUEST),
    SAME_PASSWORD(1025, "Mật khẩu bị trùng", HttpStatus.BAD_REQUEST),
    INVALID_PERIOD(1026, "Loại kỳ không hợp lệ", HttpStatus.BAD_REQUEST),
    WALLET_NAME_EXISTS(1027, "Tên ví đã được sử dụng", HttpStatus.BAD_REQUEST),
    NAME_TOO_LONG(1028, "Tên quá dài", HttpStatus.BAD_REQUEST),
    INVALID_TYPE(1029, "Loại không hợp lệ", HttpStatus.BAD_REQUEST),
    TYPE_NOT_NULL(1030, "LOẠI KHÔNG ĐƯỢC ĐỂ TRỐNG", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_NULL(1031, "EMAIL KHÔNG ĐƯỢC ĐỂ TRỐNG", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(1032, "Số điện thoại không hợp lệ", HttpStatus.BAD_REQUEST),
    ADDRESS_TOO_LONG(1028, "Địa chỉ quá dài", HttpStatus.BAD_REQUEST),
    NEWPASS_NOT_SAME(1028, "Mật khẩu xác nhận phải giống nhau", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_LONG(1023, "Mật khẩu quá dài", HttpStatus.BAD_REQUEST),
    BUDGET_UPDATE_FAILED(1023, "Cập nhật hạn mức thất bại", HttpStatus.EXPECTATION_FAILED),
    NOTIFICATION_NOT_FOUND_OR_FORBIDDEN(1024, "Không có thông báo", HttpStatus.FORBIDDEN),
    PRODUCT_NOT_FOUND(2000, "Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_AVAILABLE(2001, "Sản phẩm hiện không khả dụng", HttpStatus.BAD_REQUEST),
    PRODUCT_OUT_OF_STOCK(2002, "Sản phẩm đã hết hàng", HttpStatus.BAD_REQUEST),
    CART_EMPTY(2003, "Giỏ hàng trống", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND(2004, "Không tìm thấy mục trong giỏ", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND(2005, "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    FORBIDDEN_RESOURCE(2006, "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),
    INVALID_ORDER_STATUS_TRANSITION(2007, "Không thể cập nhật trạng thái đơn hàng", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_FOUND(2008, "Không tìm thấy đánh giá", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS(2009, "Bạn đã đánh giá sản phẩm này", HttpStatus.BAD_REQUEST),
    WISHLIST_NOT_FOUND(2010, "Không tìm thấy mục yêu thích", HttpStatus.NOT_FOUND),
    WISHLIST_ITEM_EXISTS(2011, "Sản phẩm đã có trong danh sách yêu thích", HttpStatus.BAD_REQUEST),
    ADDRESS_NOT_FOUND(2012, "Không tìm thấy địa chỉ", HttpStatus.NOT_FOUND),
    SHIPPING_NOT_FOUND(2013, "Không tìm thấy thông tin vận chuyển", HttpStatus.NOT_FOUND),
    SHIPPING_ALREADY_EXISTS(2014, "Thông tin vận chuyển đã tồn tại", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(3001, "Không có quyền thực hiện hành động này", HttpStatus.UNAUTHORIZED);

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;

        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }
}
