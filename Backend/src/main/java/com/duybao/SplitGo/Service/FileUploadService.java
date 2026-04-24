package com.duybao.SplitGo.Service;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {
    String uploadProductImage(MultipartFile file);

    String uploadUserAvatar(MultipartFile file);
}

