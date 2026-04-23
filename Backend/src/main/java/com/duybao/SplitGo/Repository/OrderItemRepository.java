package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Model.OrderItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    boolean existsByOrderIdAndSellerId(Long orderId, Long sellerId);
}

