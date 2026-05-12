package com.duybao.SplitGo.Controller;

import com.duybao.SplitGo.DTO.Response.ApiResponse;
import com.duybao.SplitGo.Service.FileUploadService;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/upload")
public class UploadController {
    private final FileUploadService fileUploadService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ApiResponse<Map<String, String>> uploadImage(
            @RequestPart("image") MultipartFile image) {
        String imageUrl = fileUploadService.uploadImage(image);
        return ApiResponse.<Map<String, String>>builder()
                .success(true)
                .code(200)
                .message("Tải ảnh thành công")
                .data(Map.of("imageUrl", imageUrl))
                .timestamp(LocalDateTime.now())
                .build();
    }
}
