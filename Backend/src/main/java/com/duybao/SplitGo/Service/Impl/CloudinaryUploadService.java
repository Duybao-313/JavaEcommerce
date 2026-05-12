package com.duybao.SplitGo.Service.Impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Service.FileUploadService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryUploadService implements FileUploadService {
    private final Cloudinary cloudinary;

    @Override
    public String uploadProductImage(MultipartFile file) {
        return upload(file, "splitgo/products");
    }

    @Override
    public String uploadUserAvatar(MultipartFile file) {
        return upload(file, "splitgo/avatars");
    }

    @Override
    public String uploadImage(MultipartFile file) {
        return upload(file, "splitgo/images");
    }

    private String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        try {
            Map<?, ?> uploaded = cloudinary
                    .uploader()
                    .upload(file.getBytes(), ObjectUtils.asMap("folder", folder, "resource_type", "auto"));
            Object secureUrl = uploaded.get("secure_url");
            if (secureUrl == null) {
                throw new AppException(ErrorCode.INTERNAL_ERROR);
            }
            return secureUrl.toString();
        } catch (IOException e) {
            throw new AppException(ErrorCode.READ_FILE_ERROR);
        }
    }
}

