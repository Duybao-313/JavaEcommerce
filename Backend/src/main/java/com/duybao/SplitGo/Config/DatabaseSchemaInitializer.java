package com.duybao.SplitGo.Config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Runs schema fixes on startup before Hibernate touches the tables.
 * Handles cases where MySQL ENUM columns need to be widened to VARCHAR
 * to support new enum values added during development.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DatabaseSchemaInitializer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixEnumColumns() {
        try {
            // Fix orders.status: ENUM → VARCHAR(50) to support PENDING_PAYMENT
            jdbcTemplate.execute(
                "ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING'"
            );
            log.info("Schema fixed: orders.status → VARCHAR(50)");
        } catch (Exception e) {
            // Column might already be VARCHAR — ignore
            log.debug("Schema fix skipped (already applied): {}", e.getMessage());
        }

        try {
            // Fix orders.payment_method: ENUM → VARCHAR(50) to support SEPAY
            jdbcTemplate.execute(
                "ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT 'COD'"
            );
            log.info("Schema fixed: orders.payment_method → VARCHAR(50)");
        } catch (Exception e) {
            log.debug("Schema fix skipped (already applied): {}", e.getMessage());
        }

        try {
            // Fix payment_transactions.method: ENUM → VARCHAR(50) to support SEPAY
            jdbcTemplate.execute(
                "ALTER TABLE payment_transactions MODIFY COLUMN method VARCHAR(50) NOT NULL DEFAULT 'COD'"
            );
            log.info("Schema fixed: payment_transactions.method → VARCHAR(50)");
        } catch (Exception e) {
            log.debug("Schema fix skipped (already applied): {}", e.getMessage());
        }
    }
}
