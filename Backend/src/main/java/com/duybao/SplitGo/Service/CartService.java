package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.CartResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.AddCartItemRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateCartItemRequest;

public interface CartService {
    CartResponse getMyCart(Long buyerId);

    CartResponse addItem(Long buyerId, AddCartItemRequest request);

    CartResponse updateItem(Long buyerId, Long cartItemId, UpdateCartItemRequest request);

    CartResponse removeItem(Long buyerId, Long cartItemId);
}

