package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.ProductOptionResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ProductResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.ProductVariantResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateProductRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.ProductOptionRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.ProductVariantRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateProductRequest;
import com.duybao.SplitGo.Enum.ProductStatus;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Category;
import com.duybao.SplitGo.Model.Product;
import com.duybao.SplitGo.Model.ProductVariant;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.CategoryRepository;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Repository.ProductVariantRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.CatalogService;
import com.duybao.SplitGo.Service.FileUploadService;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CatalogServiceImpl implements CatalogService {
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    public CatalogServiceImpl(
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            FileUploadService fileUploadService) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.fileUploadService = fileUploadService;
    }

    @Override
    public List<ProductResponse> getPublicProducts() {
        return productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE).stream()
                .map(this::toProductResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toProductResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getProductsBySellerId(Long sellerId) {
        return productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(this::toProductResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse getProductDetail(Long productId) {
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        Long currentViews = product.getViewCount() == null ? 0L : product.getViewCount();
        product.setViewCount(currentViews + 1);
        productRepository.save(product);
        return toProductResponse(product);
    }


    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request, Long actorId, boolean isAdmin, MultipartFile imageFile) {
        Long ownerId = isAdmin && request.getOwnerId() != null ? request.getOwnerId() : actorId;
        User seller = userRepository.findById(ownerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String imageUrl = request.getImageUrl();
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = fileUploadService.uploadProductImage(imageFile);
        }

        List<ProductVariantRequest> variantRequests = request.getVariants();
        boolean hasVariants = variantRequests != null && !variantRequests.isEmpty();

        // Validate: if variants present, each must have price and stock
        if (hasVariants) {
            for (ProductVariantRequest vr : variantRequests) {
                if (vr.getPrice() == null || vr.getStock() == null) {
                    throw new AppException(ErrorCode.INVALID_REQUEST);
                }
                if (vr.getSku() != null && !vr.getSku().isBlank() && variantRepository.existsBySku(vr.getSku())) {
                    throw new AppException(ErrorCode.VARIANT_SKU_DUPLICATE);
                }
            }
            // Validate options-variants consistency
            validateOptionsAndVariants(request);
        }

        // For product with variants, compute aggregate stock
        Integer productStock = request.getStock();
        if (hasVariants) {
            productStock = variantRequests.stream()
                    .mapToInt(ProductVariantRequest::getStock)
                    .sum();
        }
        // Fallback: ensure stock is never null (DB constraint)
        if (productStock == null) {
            productStock = 0;
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .salePrice(request.getSalePrice())
                .weight(request.getWeight())
                .sku(hasVariants ? null : request.getSku())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .stock(productStock)
                .imageUrl(imageUrl)
                .status(ProductStatus.ACTIVE)
                .seller(seller)
                .category(resolveCategory(request.getCategoryId(), request.getCategoryName()))
                .build();

        Product savedProduct = productRepository.save(product);

        // Create variants if present
        if (hasVariants) {
            for (ProductVariantRequest vr : variantRequests) {
                ProductVariant variant = ProductVariant.builder()
                        .product(savedProduct)
                        .sku(vr.getSku())
                        .attributes(vr.getAttributes())
                        .price(vr.getPrice())
                        .salePrice(vr.getSalePrice())
                        .stock(vr.getStock())
                        .imageUrl(vr.getImageUrl())
                        .weight(vr.getWeight())
                        .build();
                variantRepository.save(variant);
            }
        }

        return toProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long productId, UpdateProductRequest request, Long actorId, boolean isAdmin) {
        Product product = resolveMutableProduct(productId, actorId, isAdmin);

        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getSalePrice() != null) {
            product.setSalePrice(request.getSalePrice());
        }
        if (request.getWeight() != null) {
            product.setWeight(request.getWeight());
        }
        if (request.getSku() != null) {
            product.setSku(request.getSku());
        }
        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }
        if (request.getStock() != null) {
            product.setStock(request.getStock());
        }
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository
                    .findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }

        // Handle variant updates if provided
        List<ProductVariantRequest> variantRequests = request.getVariants();
        if (variantRequests != null && !variantRequests.isEmpty()) {
            // Validate options-variants consistency
            CreateProductRequest tempReq = new CreateProductRequest();
            tempReq.setOptions(request.getOptions());
            tempReq.setVariants(variantRequests);
            validateOptionsAndVariants(tempReq);

            // Validate SKU uniqueness among new variants
            for (ProductVariantRequest vr : variantRequests) {
                if (vr.getSku() != null && !vr.getSku().isBlank()) {
                    Optional<ProductVariant> existing = variantRepository.findBySku(vr.getSku());
                    if (existing.isPresent() && !existing.get().getProduct().getId().equals(productId)) {
                        throw new AppException(ErrorCode.VARIANT_SKU_DUPLICATE);
                    }
                }
            }

            // Remove old variants and create new ones (simple replace strategy)
            List<ProductVariant> oldVariants = variantRepository.findByProductIdOrderByIdAsc(productId);
            variantRepository.deleteAll(oldVariants);

            int totalStock = 0;
            for (ProductVariantRequest vr : variantRequests) {
                if (vr.getPrice() == null || vr.getStock() == null) {
                    throw new AppException(ErrorCode.INVALID_REQUEST);
                }
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(vr.getSku())
                        .attributes(vr.getAttributes())
                        .price(vr.getPrice())
                        .salePrice(vr.getSalePrice())
                        .stock(vr.getStock())
                        .imageUrl(vr.getImageUrl())
                        .weight(vr.getWeight())
                        .build();
                variantRepository.save(variant);
                totalStock += vr.getStock();
            }
            product.setStock(totalStock);
        }

        return toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId, Long actorId, boolean isAdmin) {
        Product product = resolveMutableProduct(productId, actorId, isAdmin);
        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProductImage(Long productId, Long actorId, boolean isAdmin, MultipartFile imageFile) {
        Product product = resolveMutableProduct(productId, actorId, isAdmin);

        if (imageFile == null || imageFile.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String imageUrl = fileUploadService.uploadProductImage(imageFile);
        product.setImageUrl(imageUrl);
        return toProductResponse(productRepository.save(product));
    }

    private Product resolveMutableProduct(Long productId, Long actorId, boolean isAdmin) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (!isAdmin && !product.getSeller().getId().equals(actorId)) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return product;
    }

    private Category resolveCategory(Long categoryId, String categoryName) {
        if (categoryId != null) {
            return categoryRepository.findById(categoryId).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        }
        if (categoryName == null || categoryName.isBlank()) {
            return null;
        }
        return categoryRepository.findByNameIgnoreCase(categoryName).orElseGet(() -> categoryRepository.save(Category.builder()
                .name(categoryName)
                .description("Auto-created from seller request")
                .build()));
    }

    /**
     * Validates that if options are defined, every variant must:
     * - Contain all required option keys in its attributes
     * - Have attribute values that belong to the allowed values for each option
     * - Each option key must have exactly one value per variant
     */
    private void validateOptionsAndVariants(CreateProductRequest req) {
        List<ProductOptionRequest> options = req.getOptions();
        List<ProductVariantRequest> variants = req.getVariants();

        if (options == null || options.isEmpty()) {
            return; // no options defined, skip validation
        }

        if (variants == null || variants.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                    "Phải cung cấp ít nhất 1 variant khi có options");
        }

        // Collect required option keys
        Set<String> optionKeys = options.stream()
                .map(ProductOptionRequest::getName)
                .collect(Collectors.toSet());

        // Build allowed values map
        Map<String, Set<String>> allowed = new HashMap<>();
        for (ProductOptionRequest o : options) {
            if (o.getValues() == null || o.getValues().isEmpty()) {
                throw new AppException(ErrorCode.INVALID_REQUEST,
                        "Option '" + o.getName() + "' phải có ít nhất 1 giá trị");
            }
            allowed.put(o.getName(), new HashSet<>(o.getValues()));
        }

        for (ProductVariantRequest v : variants) {
            Map<String, String> attrs = v.getAttributes();
            if (attrs == null || attrs.isEmpty()) {
                throw new AppException(ErrorCode.INVALID_REQUEST,
                        "Variant thiếu attributes, cần có: " + optionKeys);
            }
            // Check that all required option keys are present
            if (!attrs.keySet().containsAll(optionKeys)) {
                throw new AppException(ErrorCode.INVALID_REQUEST,
                        "Variant phải có tất cả option: " + optionKeys);
            }
            // Check each value is allowed
            for (String key : optionKeys) {
                String val = attrs.get(key);
                if (val == null || !allowed.get(key).contains(val)) {
                    throw new AppException(ErrorCode.INVALID_REQUEST,
                            "Giá trị không hợp lệ cho '" + key + "': " + val
                                    + ". Giá trị hợp lệ: " + allowed.get(key));
                }
            }
        }
    }

    @Override
    public List<ProductVariantResponse> getVariantsByProductId(Long productId) {
        return variantRepository.findByProductIdOrderByIdAsc(productId).stream()
                .map(this::toVariantResponse)
                .toList();
    }

    private ProductResponse toProductResponse(Product product) {
        List<ProductVariantResponse> variantResponses = variantRepository
                .findByProductIdOrderByIdAsc(product.getId()).stream()
                .map(this::toVariantResponse)
                .toList();

        // Derive options from variants' attribute keys and unique values
        List<ProductOptionResponse> optionResponses = deriveOptions(variantResponses);

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .weight(product.getWeight())
                .sku(product.getSku())
                .isFeatured(product.getIsFeatured())
                .imageUrl(product.getImageUrl())
                .stock(product.getStock())
                .viewCount(product.getViewCount() == null ? 0L : product.getViewCount())
                .soldCount(product.getSoldCount() == null ? 0L : product.getSoldCount())
                .status(product.getStatus())
                .sellerId(product.getSeller().getId())
                .sellerUsername(product.getSeller().getUsername())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .options(optionResponses.isEmpty() ? null : optionResponses)
                .variants(variantResponses.isEmpty() ? null : variantResponses)
                .build();
    }

    private ProductVariantResponse toVariantResponse(ProductVariant variant) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .attributes(variant.getAttributes())
                .price(variant.getPrice())
                .salePrice(variant.getSalePrice())
                .stock(variant.getStock())
                .imageUrl(variant.getImageUrl())
                .weight(variant.getWeight())
                .build();
    }

    /**
     * Derives option types and their unique values from the list of variants.
     * For example, if variants have attributes: {color: red, size: XL}, {color: blue, size: M},
     * this returns options: [{name: color, values: [red, blue]}, {name: size, values: [XL, M]}].
     */
    private List<ProductOptionResponse> deriveOptions(List<ProductVariantResponse> variants) {
        if (variants == null || variants.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, Set<String>> optionMap = new HashMap<>();
        for (ProductVariantResponse v : variants) {
            Map<String, String> attrs = v.getAttributes();
            if (attrs != null) {
                for (Map.Entry<String, String> entry : attrs.entrySet()) {
                    optionMap.computeIfAbsent(entry.getKey(), k -> new HashSet<>())
                            .add(entry.getValue());
                }
            }
        }
        if (optionMap.isEmpty()) {
            return Collections.emptyList();
        }
        List<ProductOptionResponse> result = new ArrayList<>();
        for (Map.Entry<String, Set<String>> entry : optionMap.entrySet()) {
            result.add(ProductOptionResponse.builder()
                    .name(entry.getKey())
                    .values(new ArrayList<>(entry.getValue()))
                    .required(true)
                    .build());
        }
        return result;
    }
}

