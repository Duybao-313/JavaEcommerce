package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Enum.ProductStatus;
import com.duybao.SplitGo.Model.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);

    Page<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status, Pageable pageable);

    List<Product> findAllByOrderByCreatedAtDesc();

    Page<Product> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    Page<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    Page<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status, Pageable pageable);

    Optional<Product> findByIdAndSellerId(Long id, Long sellerId);

    List<Product> findByCategoryIdAndStatusOrderByCreatedAtDesc(Long categoryId, ProductStatus status);

    Page<Product> findByCategoryIdAndStatusOrderByCreatedAtDesc(Long categoryId, ProductStatus status, Pageable pageable);

    List<Product> findByCategoryIdInAndStatusOrderByCreatedAtDesc(List<Long> categoryIds, ProductStatus status);

    Page<Product> findByCategoryIdInAndStatusOrderByCreatedAtDesc(List<Long> categoryIds, ProductStatus status, Pageable pageable);

    long countByCategoryId(Long categoryId);
}

