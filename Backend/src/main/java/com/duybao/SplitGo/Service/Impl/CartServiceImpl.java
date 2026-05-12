package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.CartItemResponse;
import com.duybao.SplitGo.DTO.Response.ecommerce.CartResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.AddCartItemRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateCartItemRequest;
import com.duybao.SplitGo.Enum.ProductStatus;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Cart;
import com.duybao.SplitGo.Model.CartItem;
import com.duybao.SplitGo.Model.Product;
import com.duybao.SplitGo.Model.ProductVariant;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.CartItemRepository;
import com.duybao.SplitGo.Repository.CartRepository;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Repository.ProductVariantRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.CartService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CartResponse getMyCart(Long buyerId) {
        Cart cart = getOrCreateCart(buyerId);
        return toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(Long buyerId, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(buyerId);
        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductVariant variant;
        BigDecimal itemPrice;
        int availableStock;

        if (request.getVariantId() != null) {
            variant = variantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            itemPrice = variant.getSalePrice() != null ? variant.getSalePrice() : variant.getPrice();
            availableStock = variant.getStock();
        } else {
            variant = null;
            itemPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            availableStock = product.getStock();
        }

        validateProductCanBuy(product, request.getQuantity(), availableStock);

        // Find existing cart item by product + variant (or null variant)
        Optional<CartItem> existingItem;
        if (variant != null) {
            existingItem = cartItemRepository.findByCartIdAndProductIdAndVariantId(
                    cart.getId(), product.getId(), variant.getId());
        } else {
            existingItem = cartItemRepository.findByCartIdAndProductIdAndVariantIdIsNull(
                    cart.getId(), product.getId());
        }

        CartItem item = existingItem.orElseGet(() -> CartItem.builder()
                .cart(cart)
                .product(product)
                .variant(variant)
                .quantity(0)
                .priceSnapshot(itemPrice)
                .build());

        int newQty = item.getQuantity() + request.getQuantity();
        if (newQty > availableStock) {
            throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
        }

        item.setQuantity(newQty);
        item.setPriceSnapshot(itemPrice);
        cartItemRepository.save(item);

        return getMyCart(buyerId);
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long buyerId, Long cartItemId, UpdateCartItemRequest request) {
        CartItem item = cartItemRepository
                .findByIdAndCartUserId(cartItemId, buyerId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        int availableStock;
        if (item.getVariant() != null) {
            availableStock = item.getVariant().getStock();
        } else {
            availableStock = item.getProduct().getStock();
        }

        validateProductCanBuy(item.getProduct(), request.getQuantity(), availableStock);
        item.setQuantity(request.getQuantity());
        item.setPriceSnapshot(item.getProduct().getPrice());
        cartItemRepository.save(item);

        return getMyCart(buyerId);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long buyerId, Long cartItemId) {
        CartItem item = cartItemRepository
                .findByIdAndCartUserId(cartItemId, buyerId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
        Cart cart = item.getCart();
        if (cart != null && cart.getItems() != null) {
            cart.getItems().removeIf(existing -> existing.getId().equals(item.getId()));
        }
        cartItemRepository.delete(item);
        return getMyCart(buyerId);
    }

    private void validateProductCanBuy(Product product, Integer qty, int availableStock) {
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new AppException(ErrorCode.PRODUCT_NOT_AVAILABLE);
        }
        if (qty > availableStock) {
            throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
        }
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            Cart cart = Cart.builder().user(user).build();
            return cartRepository.save(cart);
        });
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(item -> {
                    BigDecimal lineTotal = item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));
                    return CartItemResponse.builder()
                            .cartItemId(item.getId())
                            .productId(item.getProduct().getId())
                            .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                            .productName(item.getProduct().getName())
                            .imageUrl(item.getProduct().getImageUrl())
                            .variantAttributes(item.getVariant() != null ? item.getVariant().getAttributes() : null)
                            .quantity(item.getQuantity())
                            .unitPrice(item.getPriceSnapshot())
                            .lineTotal(lineTotal)
                            .build();
                })
                .toList();

        BigDecimal total = items.stream().map(CartItemResponse::getLineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getId())
                .buyerId(cart.getUser().getId())
                .items(items)
                .totalAmount(total)
                .build();
    }
}

