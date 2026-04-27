package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.ProductResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateProductRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateProductRequest;
import com.duybao.SplitGo.Enum.ProductStatus;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Category;
import com.duybao.SplitGo.Model.Product;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.CategoryRepository;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.CatalogService;
import com.duybao.SplitGo.Service.FileUploadService;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CatalogServiceImpl implements CatalogService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    public CatalogServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            FileUploadService fileUploadService) {
        this.productRepository = productRepository;
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
    public ProductResponse createProduct(CreateProductRequest request, Long sellerId, MultipartFile imageFile) {
        User seller = userRepository.findById(sellerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String imageUrl = request.getImageUrl();
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = fileUploadService.uploadProductImage(imageFile);
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(imageUrl)
                .status(ProductStatus.ACTIVE)
                .seller(seller)
                .category(resolveCategory(request.getCategoryId(), request.getCategoryName()))
                .build();

        return toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long productId, UpdateProductRequest request, Long sellerId) {
        Product product = productRepository
                .findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
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

        return toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProductImage(Long productId, Long sellerId, MultipartFile imageFile) {
        Product product = productRepository
                .findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (imageFile == null || imageFile.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String imageUrl = fileUploadService.uploadProductImage(imageFile);
        product.setImageUrl(imageUrl);
        return toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId, Long sellerId) {
        Product product = productRepository
                .findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
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

    private ProductResponse toProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
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
                .build();
    }
}

