package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.CategoryResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateCategoryRequest;
import com.duybao.SplitGo.Service.CategoryService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/categories")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách danh mục thành công")
                .data(categoryService.getAllCategories())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/roots")
    public ApiResponse<List<CategoryResponse>> getRootCategories() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách danh mục gốc thành công")
                .data(categoryService.getRootCategories())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> createCategory(@RequestBody @Valid CreateCategoryRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .success(true)
                .code(201)
                .message("Tạo danh mục thành công")
                .data(categoryService.createCategory(request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable Long id, @RequestBody @Valid CreateCategoryRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .success(true)
                .code(200)
                .message("Cập nhật danh mục thành công")
                .data(categoryService.updateCategory(id, request))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.<Void>builder()
                .success(true)
                .code(200)
                .message("Xóa danh mục thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }
}

