package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.ProductResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateProductRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateProductRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface CatalogService {
    List<ProductResponse> getPublicProducts();

    ProductResponse getProductDetail(Long productId);

    ProductResponse createProduct(CreateProductRequest request, Long sellerId);

    ProductResponse createProduct(CreateProductRequest request, Long sellerId, MultipartFile imageFile);

    ProductResponse updateProduct(Long productId, UpdateProductRequest request, Long sellerId);

    void deleteProduct(Long productId, Long sellerId);
}

