package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ProductResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ProductVariantResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateProductRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateProductRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateProductStatusRequest;
import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Service.CatalogService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {
    private final CatalogService catalogService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // Prevent Spring from trying to bind the "variants" and "options" JSON strings
        // to CreateProductRequest fields. They are parsed manually via @RequestParam.
        binder.setDisallowedFields("variants", "options");
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getProducts() {
        return ApiResponse.<List<ProductResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách sản phẩm thành công")
                .data(catalogService.getPublicProducts())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ProductResponse>> getAllProductsForAdmin() {
        return ApiResponse.<List<ProductResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách toàn bộ sản phẩm thành công")
                .data(catalogService.getAllProducts())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<List<ProductResponse>> getProductsBySeller(
            @AuthenticationPrincipal User user, @PathVariable Long sellerId) {
        if (!user.getId().equals(sellerId)) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return ApiResponse.<List<ProductResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách sản phẩm của seller thành công")
                .data(catalogService.getProductsBySellerId(sellerId))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id) {
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .code(200)
                .message("Lấy chi tiết sản phẩm thành công")
                .data(catalogService.getProductDetail(id))
                .timestamp(LocalDateTime.now())
                .build();
    }



    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<ProductResponse> createProductWithImage(
            @AuthenticationPrincipal User user,
            @Valid @ModelAttribute CreateProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "variants", required = false) String variantsJson,
            @RequestParam(value = "options", required = false) String optionsJson) {
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        // Parse options JSON
        if (optionsJson != null && !optionsJson.isBlank()) {
            try {
                List<com.duybao.SplitGo.DTO.request.ecommerce.ProductOptionRequest> options = mapper.readValue(
                        optionsJson,
                        mapper.getTypeFactory().constructCollectionType(List.class,
                                com.duybao.SplitGo.DTO.request.ecommerce.ProductOptionRequest.class));
                request.setOptions(options);
            } catch (Exception e) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
        }

        // Parse variants JSON
        if (variantsJson != null && !variantsJson.isBlank()) {
            try {
                List<com.duybao.SplitGo.DTO.request.ecommerce.ProductVariantRequest> variants = mapper.readValue(
                        variantsJson,
                        mapper.getTypeFactory().constructCollectionType(List.class,
                                com.duybao.SplitGo.DTO.request.ecommerce.ProductVariantRequest.class));
                request.setVariants(variants);
            } catch (Exception e) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
        }
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .code(201)
                .message("Tạo sản phẩm thành công")
                .data(catalogService.createProduct(request, user.getId(), isAdmin, image))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<ProductResponse> updateProduct(
            @AuthenticationPrincipal User user, @PathVariable Long id, @RequestBody @Valid UpdateProductRequest request) {
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .code(200)
                .message("Cập nhật sản phẩm thành công")
                .data(catalogService.updateProduct(id, request, user.getId(), isAdmin))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<ProductResponse> updateProductImage(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image) {
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .code(200)
                .message("Cập nhật ảnh sản phẩm thành công")
                .data(catalogService.updateProductImage(id, user.getId(), isAdmin, image))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<Void> deleteProduct(@AuthenticationPrincipal User user, @PathVariable Long id) {
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        catalogService.deleteProduct(id, user.getId(), isAdmin);
        return ApiResponse.<Void>builder()
                .success(true)
                .code(200)
                .message("Ẩn sản phẩm thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductResponse> updateProductStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody @Valid UpdateProductStatusRequest request) {
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .code(200)
                .message("Cập nhật trạng thái sản phẩm thành công")
                .data(catalogService.updateProductStatus(id, request.getStatus(), user.getId(), isAdmin))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/{id}/variants")
    public ApiResponse<List<ProductVariantResponse>> getVariants(@PathVariable Long id) {
        return ApiResponse.<List<ProductVariantResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách biến thể thành công")
                .data(catalogService.getVariantsByProductId(id))
                .timestamp(LocalDateTime.now())
                .build();
    }
}

