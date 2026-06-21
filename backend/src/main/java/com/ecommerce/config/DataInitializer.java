package com.ecommerce.config;

import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.entity.enums.Role;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .name("Admin").email("admin@shop.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN).build());
            userRepository.save(User.builder()
                    .name("Demo User").email("user@shop.com")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.ROLE_CUSTOMER).build());
        }

        if (categoryRepository.count() > 0) return;

        Category electronics = categoryRepository.save(
                Category.builder().name("Electronics").slug("electronics").description("Gadgets and devices").build());
        Category clothing = categoryRepository.save(
                Category.builder().name("Clothing").slug("clothing").description("Apparel and accessories").build());
        Category home = categoryRepository.save(
                Category.builder().name("Home & Kitchen").slug("home-kitchen").description("Home essentials").build());

        productRepository.save(Product.builder()
                .name("Wireless Headphones").sku("WH-001").price(new BigDecimal("79.99"))
                .description("Noise-canceling Bluetooth headphones").stockQuantity(50)
                .imageUrl("https://picsum.photos/seed/headphones/400/400")
                .category(electronics).build());
        productRepository.save(Product.builder()
                .name("Smart Watch").sku("SW-001").price(new BigDecimal("199.99"))
                .description("Fitness tracking smartwatch with heart rate monitor").stockQuantity(30)
                .imageUrl("https://picsum.photos/seed/watch/400/400")
                .category(electronics).build());
        productRepository.save(Product.builder()
                .name("Cotton T-Shirt").sku("CT-001").price(new BigDecimal("24.99"))
                .description("Premium cotton t-shirt, available in multiple colors").stockQuantity(100)
                .imageUrl("https://picsum.photos/seed/tshirt/400/400")
                .category(clothing).build());
        productRepository.save(Product.builder()
                .name("Denim Jacket").sku("DJ-001").price(new BigDecimal("89.99"))
                .description("Classic denim jacket with modern fit").stockQuantity(25)
                .imageUrl("https://picsum.photos/seed/jacket/400/400")
                .category(clothing).build());
        productRepository.save(Product.builder()
                .name("Coffee Maker").sku("CM-001").price(new BigDecimal("49.99"))
                .description("12-cup programmable drip coffee maker").stockQuantity(40)
                .imageUrl("https://picsum.photos/seed/coffee/400/400")
                .category(home).build());
        productRepository.save(Product.builder()
                .name("LED Desk Lamp").sku("DL-001").price(new BigDecimal("34.99"))
                .description("Adjustable LED desk lamp with USB charging port").stockQuantity(60)
                .imageUrl("https://picsum.photos/seed/lamp/400/400")
                .category(home).build());

        productRepository.save(Product.builder()
                .name("Gaming Keyboard").sku("GK-001").price(new BigDecimal("129.99"))
                .description("Mechanical gaming keyboard with RGB backlighting").stockQuantity(35)
                .imageUrl("https://picsum.photos/seed/keyboard/400/400")
                .category(electronics).build());
        productRepository.save(Product.builder()
                .name("Bluetooth Speaker").sku("BS-001").price(new BigDecimal("59.99"))
                .description("Portable waterproof Bluetooth speaker with deep bass").stockQuantity(45)
                .imageUrl("https://picsum.photos/seed/speaker/400/400")
                .category(electronics).build());
        productRepository.save(Product.builder()
                .name("Running Shoes").sku("RS-001").price(new BigDecimal("119.99"))
                .description("Lightweight running shoes with cushioned sole").stockQuantity(50)
                .imageUrl("https://picsum.photos/seed/shoes/400/400")
                .category(clothing).build());
        productRepository.save(Product.builder()
                .name("Leather Wallet").sku("LW-001").price(new BigDecimal("39.99"))
                .description("Genuine leather bifold wallet with RFID protection").stockQuantity(80)
                .imageUrl("https://picsum.photos/seed/wallet/400/400")
                .category(clothing).build());
        productRepository.save(Product.builder()
                .name("Air Fryer").sku("AF-001").price(new BigDecimal("89.99"))
                .description("Digital air fryer with 8 preset cooking programs").stockQuantity(30)
                .imageUrl("https://picsum.photos/seed/airfryer/400/400")
                .category(home).build());
        productRepository.save(Product.builder()
                .name("Throw Blanket").sku("TB-001").price(new BigDecimal("29.99"))
                .description("Soft microfiber throw blanket, machine washable").stockQuantity(100)
                .imageUrl("https://picsum.photos/seed/blanket/400/400")
                .category(home).build());
    }
}
