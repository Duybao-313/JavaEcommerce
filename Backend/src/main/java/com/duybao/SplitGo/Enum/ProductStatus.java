package com.duybao.SplitGo.Enum;

public enum ProductStatus {
    /** Sản phẩm đã được duyệt, hiển thị công khai và có thể mua */
    ACTIVE,
    /** Sản phẩm bị khóa / xóa mềm */
    INACTIVE,
    /** Sản phẩm chờ admin duyệt (seller mới tạo hoặc đã chỉnh sửa lại) */
    PENDING_REVIEW,
    /** Admin từ chối duyệt sản phẩm */
    REJECTED,
    /** Admin yêu cầu seller chỉnh sửa thêm */
    PENDING_CHANGES
}

