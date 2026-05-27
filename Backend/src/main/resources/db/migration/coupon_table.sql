-- Coupon table migration for SplitGo
-- Run this against your MySQL/MariaDB database before deploying the Coupon entity.

CREATE TABLE IF NOT EXISTS coupon (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    type VARCHAR(32) NOT NULL COMMENT 'PERCENT, FIXED, FREE_SHIPPING',
    value DECIMAL(19,2),
    max_discount_amount DECIMAL(19,2),
    min_order_value DECIMAL(19,2),
    scope VARCHAR(32) DEFAULT 'ALL' COMMENT 'ALL, PRODUCT, CATEGORY, SELLER, USER',
    target_ids_json TEXT COMMENT 'JSON array of target IDs',
    start_at DATETIME,
    end_at DATETIME,
    usage_limit INT,
    per_user_limit INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0 COMMENT '@Version for optimistic locking',

    UNIQUE INDEX idx_coupon_code (code),
    INDEX idx_coupon_active (is_active),
    INDEX idx_coupon_time (start_at, end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
