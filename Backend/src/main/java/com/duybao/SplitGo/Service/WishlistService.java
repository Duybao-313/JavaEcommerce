package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.WishlistResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateWishlistRequest;
import java.util.List;

public interface WishlistService {
    WishlistResponse addToWishlist(Long userId, CreateWishlistRequest request);

    WishlistResponse removeFromWishlist(Long userId, Long productId);

    List<WishlistResponse> getUserWishlist(Long userId);

    boolean isProductInWishlist(Long userId, Long productId);
}

