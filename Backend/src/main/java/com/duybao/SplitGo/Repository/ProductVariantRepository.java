package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Model.ProductVariant;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdOrderByIdAsc(Long productId);

    Optional<ProductVariant> findBySku(String sku);

    boolean existsBySku(String sku);

    @Modifying
    @Transactional
    @Query("UPDATE ProductVariant v SET v.stock = v.stock - :qty WHERE v.id = :variantId AND v.stock >= :qty")
    int decrementStock(@Param("variantId") Long variantId, @Param("qty") int qty);

    @Modifying
    @Transactional
    @Query("UPDATE ProductVariant v SET v.stock = v.stock + :qty WHERE v.id = :variantId")
    int incrementStock(@Param("variantId") Long variantId, @Param("qty") int qty);
}
