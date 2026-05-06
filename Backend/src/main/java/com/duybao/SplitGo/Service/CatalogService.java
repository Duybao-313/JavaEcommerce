package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.ProductResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateProductRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateProductRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface CatalogService {
    List<ProductResponse> getPublicProducts();

    List<ProductResponse> getAllProducts();

    List<ProductResponse> getProductsBySellerId(Long sellerId);

    ProductResponse getProductDetail(Long productId);


    ProductResponse createProduct(CreateProductRequest request, Long actorId, boolean isAdmin, MultipartFile imageFile);

    ProductResponse updateProduct(Long productId, UpdateProductRequest request, Long actorId, boolean isAdmin);

    ProductResponse updateProductImage(Long productId, Long actorId, boolean isAdmin, MultipartFile imageFile);

    void deleteProduct(Long productId, Long actorId, boolean isAdmin);
}

