 package com.duybao.SplitGo.Config;

 import com.cloudinary.Cloudinary;
 import com.cloudinary.utils.ObjectUtils;
 import org.springframework.context.annotation.Bean;
 import org.springframework.context.annotation.Configuration;

 @Configuration
 public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dxsxa1tm7",
                "api_key", "962564135172319",
                "api_secret", "6rNIylkunBItbwaYQl28ob_i5S4"
        ));
    }
 }
