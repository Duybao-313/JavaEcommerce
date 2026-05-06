package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Model.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.Optional;

@Repository
public interface ShippingRepository extends JpaRepository<Shipping, Long> {
    Optional<Shipping> findByOrderId(Long orderId);

    Optional<Shipping> findByTrackingCode(String trackingCode);

    Optional<Shipping> findAllByOrderByCreatedAtDesc();
}

