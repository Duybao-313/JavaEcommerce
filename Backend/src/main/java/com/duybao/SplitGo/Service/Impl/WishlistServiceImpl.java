package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.WishlistResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateWishlistRequest;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Product;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Model.Wishlist;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Repository.WishlistRepository;
import com.duybao.SplitGo.Service.WishlistService;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class WishlistServiceImpl implements WishlistService {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistServiceImpl(
            WishlistRepository wishlistRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public WishlistResponse addToWishlist(Long userId, CreateWishlistRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (wishlistRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new AppException(ErrorCode.WISHLIST_ITEM_EXISTS);
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        return toWishlistResponse(wishlistRepository.save(wishlist));
    }

    @Override
    @Transactional
    public WishlistResponse removeFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new AppException(ErrorCode.WISHLIST_NOT_FOUND));

        wishlistRepository.delete(wishlist);
        return toWishlistResponse(wishlist);
    }

    @Override
    public List<WishlistResponse> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(this::toWishlistResponse)
                .toList();
    }

    @Override
    public boolean isProductInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    private WishlistResponse toWishlistResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        return WishlistResponse.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUser().getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImageUrl())
                .productPrice(product.getPrice().toString())
                .createdAt(wishlist.getCreatedAt())
                .build();
    }
}

