package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.ProductResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ProductVariantResponse;
import com.duybao.SplitGo.DTO.Response.PageResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateProductRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateProductRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface CatalogService {
    PageResponse<ProductResponse> getPublicProducts(int page, int size);

    PageResponse<ProductResponse> getAllProducts(int page, int size, String statusFilter);

    PageResponse<ProductResponse> getProductsBySellerId(Long sellerId, int page, int size);

    PageResponse<ProductResponse> getProductsByCategoryId(Long categoryId, int page, int size);

    ProductResponse getProductDetail(Long productId);

    ProductResponse createProduct(CreateProductRequest request, Long actorId, boolean isAdmin, MultipartFile imageFile);

    ProductResponse updateProduct(Long productId, UpdateProductRequest request, Long actorId, boolean isAdmin);

    ProductResponse updateProductImage(Long productId, Long actorId, boolean isAdmin, MultipartFile imageFile);

    void deleteProduct(Long productId, Long actorId, boolean isAdmin);

    ProductResponse updateProductStatus(Long productId, String status, String reason, Long actorId, boolean isAdmin);

    List<ProductVariantResponse> getVariantsByProductId(Long productId);
}

