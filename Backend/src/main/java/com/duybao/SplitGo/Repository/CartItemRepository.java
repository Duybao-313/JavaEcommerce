package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Model.CartItem;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByIdAndCartUserId(Long id, Long userId);

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    void deleteAllByCartId(Long cartId);
}

