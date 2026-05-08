package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Enum.ProductStatus;
import com.duybao.SplitGo.Model.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);

    List<Product> findAllByOrderByCreatedAtDesc();

    List<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    Optional<Product> findByIdAndSellerId(Long id, Long sellerId);
}

