package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.CategoryResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateCategoryRequest;
import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();

    List<CategoryResponse> getRootCategories();

    CategoryResponse createCategory(CreateCategoryRequest request);

    CategoryResponse updateCategory(Long categoryId, CreateCategoryRequest request);

    void deleteCategory(Long categoryId);

    // Admin tree management
    List<CategoryResponse> getCategoryTree();

    long getProductCountByCategory(Long categoryId);

    CategoryResponse createCategoryWithParent(CreateCategoryRequest request, Long parentId);

    CategoryResponse updateCategoryFull(Long categoryId, CreateCategoryRequest request);

    void deleteCategoryWithValidation(Long categoryId);
}

