package com.duybao.SplitGo.Config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Enum.ProductStatus;
import com.duybao.SplitGo.Model.Category;
import com.duybao.SplitGo.Model.Product;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.CategoryRepository;
import com.duybao.SplitGo.Repository.ProductRepository;
import com.duybao.SplitGo.Repository.UserRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository) {

        return args -> {
//            if (userRepository.findByUsername("admin").isEmpty()) {
//
//                User user = User.builder()
//                        .username("admin")
//                        .email("admin@admin.com")
//                        .password(passwordEncoder.encode("admin"))
//                        .role(Role.ROLE_ADMIN)
//                        .build();
//                userRepository.save(user);
//            }
//            if (userRepository.findByUsername("user").isEmpty()) {
//
//                User user = User.builder()
//                        .username("user")
//                        .email("user@user.com")
//                        .password(passwordEncoder.encode("user"))
//                        .role(Role.ROLE_USER)
//                        .build();
//                userRepository.save(user);
//            }
//            if (userRepository.findByUsername("seller").isEmpty()) {
//
//                User user = User.builder()
//                        .username("seller")
//                        .email("seller@seller.com")
//                        .password(passwordEncoder.encode("seller"))
//                        .role(Role.ROLE_SELLER)
//                        .build();
//                userRepository.save(user);
//            }

//            User seller = userRepository.findByUsername("seller")
//                    .orElseThrow(() -> new IllegalStateException("Seller account must exist before seeding products"));

//            List<CategorySeed> categorySeeds = List.of(
//                    new CategorySeed("Thời trang nam", "Quần áo, phụ kiện và giày dép cho nam"),
//                    new CategorySeed("Thời trang nữ", "Sản phẩm thời trang cho nữ"),
//                    new CategorySeed("Điện thoại", "Điện thoại thông minh và phụ kiện"),
//                    new CategorySeed("Laptop", "Laptop, máy tính và thiết bị văn phòng"),
//                    new CategorySeed("Gia dụng", "Đồ dùng gia đình và thiết bị nhà bếp"),
//                    new CategorySeed("Sức khỏe", "Chăm sóc sức khỏe và làm đẹp"),
//                    new CategorySeed("Thể thao", "Dụng cụ và trang phục thể thao"),
//                    new CategorySeed("Sách", "Sách, truyện và văn phòng phẩm"),
//                    new CategorySeed("Đồ chơi", "Đồ chơi trẻ em và giải trí"),
//                    new CategorySeed("Phụ kiện", "Mắt kính, ví, đồng hồ và phụ kiện khác"));
//
//            List<Category> categories = new ArrayList<>();
//            for (CategorySeed seed : categorySeeds) {
//                Category category = categoryRepository.findByNameIgnoreCase(seed.name())
//                        .orElseGet(() -> categoryRepository.save(Category.builder()
//                                .name(seed.name())
//                                .description(seed.description())
//                                .build()));
//                categories.add(category);
//            }
//
//            List<ProductSeed> productSeeds = List.of(
//                    new ProductSeed("Áo thun nam basic", "Áo thun cotton thoáng mát, dễ phối đồ", "Thời trang nam", new BigDecimal("199000"), 50),
//                    new ProductSeed("Quần jean slim fit", "Quần jean ôm dáng, trẻ trung", "Thời trang nam", new BigDecimal("389000"), 30),
//                    new ProductSeed("Giày sneaker trắng", "Giày sneaker phong cách tối giản", "Thời trang nam", new BigDecimal("599000"), 25),
//                    new ProductSeed("Áo sơ mi nữ công sở", "Áo sơ mi thanh lịch cho dân văn phòng", "Thời trang nữ", new BigDecimal("279000"), 40),
//                    new ProductSeed("Váy suông nữ", "Váy suông nhẹ nhàng, dễ mặc", "Thời trang nữ", new BigDecimal("459000"), 18),
//                    new ProductSeed("Điện thoại Android X1", "Màn hình lớn, pin lâu, hiệu năng ổn định", "Điện thoại", new BigDecimal("4990000"), 20),
//                    new ProductSeed("Tai nghe Bluetooth Pro", "Âm thanh rõ nét, pin bền", "Điện thoại", new BigDecimal("690000"), 60),
//                    new ProductSeed("Laptop Slim 14", "Laptop mỏng nhẹ cho học tập và làm việc", "Laptop", new BigDecimal("12990000"), 12),
//                    new ProductSeed("Chuột không dây Silent", "Chuột máy tính êm ái, kết nối ổn định", "Laptop", new BigDecimal("249000"), 70),
//                    new ProductSeed("Nồi chiên không dầu 5L", "Dung tích lớn, nấu ăn tiện lợi", "Gia dụng", new BigDecimal("1590000"), 15),
//                    new ProductSeed("Máy xay sinh tố mini", "Nhỏ gọn, phù hợp gia đình", "Gia dụng", new BigDecimal("490000"), 22),
//                    new ProductSeed("Kem dưỡng da ban đêm", "Dưỡng ẩm và phục hồi da", "Sức khỏe", new BigDecimal("320000"), 35),
//                    new ProductSeed("Máy massage cầm tay", "Thư giãn cơ bắp sau ngày dài", "Sức khỏe", new BigDecimal("850000"), 14),
//                    new ProductSeed("Bóng đá size 5", "Bền đẹp, phù hợp luyện tập", "Thể thao", new BigDecimal("290000"), 26),
//                    new ProductSeed("Thảm yoga chống trượt", "Êm ái, hỗ trợ tập luyện", "Thể thao", new BigDecimal("410000"), 33),
//                    new ProductSeed("Sách kỹ năng bán hàng", "Nội dung thực chiến cho kinh doanh", "Sách", new BigDecimal("180000"), 28),
//                    new ProductSeed("Sách truyện thiếu nhi", "Hình ảnh sinh động, dễ đọc", "Sách", new BigDecimal("120000"), 48),
//                    new ProductSeed("Bộ lego sáng tạo", "Lắp ghép vui nhộn cho trẻ em", "Đồ chơi", new BigDecimal("760000"), 19),
//                    new ProductSeed("Búp bê thời trang", "Thiết kế dễ thương, nhiều phụ kiện", "Đồ chơi", new BigDecimal("340000"), 21),
//                    new ProductSeed("Đồng hồ đeo tay nam", "Thiết kế sang trọng, chống nước", "Phụ kiện", new BigDecimal("890000"), 16));
//
//            for (ProductSeed seed : productSeeds) {
//                boolean exists = productRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId())
//                        .stream()
//                        .anyMatch(product -> product.getName() != null
//                                && product.getName().equalsIgnoreCase(seed.name()));
//
//                if (exists) {
//                    continue;
//                }
//
//                Category category = findCategory(categories, seed.categoryName())
//                        .orElseThrow(() -> new IllegalStateException(
//                                "Missing seeded category: " + seed.categoryName()));
//
//                String slug = normalizeSlug(seed.name());
//                Product product = Product.builder()
//                        .name(seed.name())
//                        .description(seed.description())
//                        .price(seed.price())
//                        .stock(seed.stock())
//                        .imageUrl("https://placehold.co/800x600?text=" + slug)
//                        .status(ProductStatus.ACTIVE)
//                        .seller(seller)
//                        .category(category)
//                        .build();
//
//                productRepository.save(product);
//            }
        };
    }

    private Optional<Category> findCategory(List<Category> categories, String categoryName) {
        return categories.stream()
                .filter(category -> category.getName() != null && category.getName().equalsIgnoreCase(categoryName))
                .findFirst();
    }

    private String normalizeSlug(String value) {
        return value == null ? "product" : value
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private record CategorySeed(String name, String description) {
    }

    private record ProductSeed(String name, String description, String categoryName, BigDecimal price, Integer stock) {
    }
}
