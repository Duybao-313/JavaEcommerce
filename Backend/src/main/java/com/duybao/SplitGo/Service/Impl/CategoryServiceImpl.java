package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.CategoryResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateCategoryRequest;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Category;
import com.duybao.SplitGo.Repository.CategoryRepository;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Service.CategoryService;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class CategoryServiceImpl implements CategoryService {
    private static final Logger log = LoggerFactory.getLogger(CategoryServiceImpl.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toCategoryResponse).toList();
    }

    @Override
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNull().stream().map(this::toCategoryResponse).toList();
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.CATEGORY_EXIST);
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long categoryId, CreateCategoryRequest request) {
        Category category =
                categoryRepository.findById(categoryId).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (request.getName() != null && !request.getName().isBlank()) {
            if (!request.getName().equals(category.getName())
                    && categoryRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
                throw new AppException(ErrorCode.CATEGORY_EXIST);
            }
            category.setName(request.getName());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        return toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category =
                categoryRepository.findById(categoryId).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        categoryRepository.delete(category);
    }

    // ==================== Admin Tree Management ====================

    @Override
    public List<CategoryResponse> getCategoryTree() {
        List<Category> allCategories = categoryRepository.findAll();

        // Build flat list of responses with product counts
        Map<Long, CategoryResponse> responseMap = allCategories.stream()
                .collect(Collectors.toMap(
                        Category::getId,
                        cat -> {
                            long productCount = productRepository.countByCategoryId(cat.getId());
                            return toCategoryResponseWithCount(cat, productCount);
                        }));

        // Build tree: attach children to their parent
        List<CategoryResponse> roots = new ArrayList<>();
        for (Category cat : allCategories) {
            CategoryResponse resp = responseMap.get(cat.getId());
            if (cat.getParent() != null) {
                CategoryResponse parentResp = responseMap.get(cat.getParent().getId());
                if (parentResp != null) {
                    if (parentResp.getChildren() == null) {
                        parentResp.setChildren(new ArrayList<>());
                    }
                    parentResp.getChildren().add(resp);
                }
            } else {
                roots.add(resp);
            }
        }

        // Compute recursive totalProductCount (post-order)
        computeRecursiveProductCounts(roots);

        return roots;
    }

    /**
     * Post-order traversal: totalProductCount = own productCount + sum of children's totalProductCount.
     */
    private void computeRecursiveProductCounts(List<CategoryResponse> nodes) {
        if (nodes == null) return;
        for (CategoryResponse node : nodes) {
            computeRecursiveProductCounts(node.getChildren());
            long childrenTotal = 0;
            if (node.getChildren() != null) {
                childrenTotal = node.getChildren().stream()
                        .mapToLong(CategoryResponse::getTotalProductCount)
                        .sum();
            }
            node.setTotalProductCount(node.getProductCount() + childrenTotal);
        }
    }

    @Override
    public long getProductCountByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return productRepository.countByCategoryId(category.getId());
    }

    @Override
    @Transactional
    public CategoryResponse createCategoryWithParent(CreateCategoryRequest request, Long parentId) {
        if (categoryRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.CATEGORY_EXIST);
        }

        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .parent(parent)
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Category saved = categoryRepository.save(category);
        long productCount = productRepository.countByCategoryId(saved.getId());
        return toCategoryResponseWithCount(saved, productCount);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategoryFull(Long categoryId, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Name validation
        if (request.getName() != null && !request.getName().isBlank()) {
            if (!request.getName().equals(category.getName())
                    && categoryRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
                throw new AppException(ErrorCode.CATEGORY_EXIST);
            }
            category.setName(request.getName());
        }

        // Description
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        // Parent
        if (request.getParentId() != null) {
            if (request.getParentId().equals(categoryId)) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        // Image URL
        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }

        // Sort order
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        // Active status
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        Category saved = categoryRepository.save(category);
        long productCount = productRepository.countByCategoryId(saved.getId());
        return toCategoryResponseWithCount(saved, productCount);
    }

    @Override
    @Transactional
    public void deleteCategoryWithValidation(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Check product count
        long productCount = productRepository.countByCategoryId(categoryId);
        if (productCount > 0) {
            log.warn("Attempt to delete category '{}' (id={}) which has {} products", category.getName(), categoryId,
                    productCount);
            throw new AppException(ErrorCode.CATEGORY_HAS_PRODUCTS);
        }

        // Check child categories
        long childCount = categoryRepository.countByParentId(categoryId);
        if (childCount > 0) {
            log.info("Deleting category '{}' (id={}) which has {} child categories", category.getName(), categoryId,
                    childCount);
        }

        log.info("Deleting category '{}' (id={})", category.getName(), categoryId);
        categoryRepository.delete(category);
    }

    // ==================== Private Helpers ====================

    private CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .sortOrder(category.getSortOrder())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    private CategoryResponse toCategoryResponseWithCount(Category category, long productCount) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .sortOrder(category.getSortOrder())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .productCount(productCount)
                .build();
    }
}

