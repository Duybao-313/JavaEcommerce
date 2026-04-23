package com.duybao.SplitGo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.duybao.SplitGo.DTO.request.ecommerce.AddCartItemRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.CheckoutRequest;
import com.duybao.SplitGo.Enum.ProductStatus;
import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Model.Product;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.CartService;
import com.duybao.SplitGo.Service.OrderService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EcommerceFlowIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Test
    void buyerCanCheckoutCodOrder() {
        User seller = userRepository.save(User.builder()
                .username("seller_1")
                .email("seller1@splitgo.dev")
                .password("secret")
                .role(Role.ROLE_SELLER)
                .build());

        User buyer = userRepository.save(User.builder()
                .username("buyer_1")
                .email("buyer1@splitgo.dev")
                .password("secret")
                .address("123 Test Street")
                .role(Role.ROLE_USER)
                .build());

        Product product = productRepository.save(Product.builder()
                .name("Ao thun")
                .description("Ao cotton")
                .price(new BigDecimal("120000"))
                .stock(5)
                .status(ProductStatus.ACTIVE)
                .seller(seller)
                .build());

        AddCartItemRequest addCartItemRequest = new AddCartItemRequest();
        addCartItemRequest.setProductId(product.getId());
        addCartItemRequest.setQuantity(2);
        cartService.addItem(buyer.getId(), addCartItemRequest);

        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setShippingAddress("456 Buyer Address");

        var order = orderService.checkout(buyer.getId(), checkoutRequest);

        assertEquals(0, new BigDecimal("240000").compareTo(order.getTotalAmount()));
        assertFalse(order.getItems().isEmpty());

        Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(3, updatedProduct.getStock());
    }
}


