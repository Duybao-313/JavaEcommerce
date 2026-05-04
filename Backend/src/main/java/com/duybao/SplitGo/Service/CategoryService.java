package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.CategoryResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateCategoryRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateCategoryRequest;
import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();

    CategoryResponse createCategory(CreateCategoryRequest request);

    CategoryResponse updateCategory(Long categoryId, UpdateCategoryRequest request);

    void deleteCategory(Long categoryId);
}

