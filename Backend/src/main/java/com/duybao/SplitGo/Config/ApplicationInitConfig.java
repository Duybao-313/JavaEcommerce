package com.duybao.SplitGo.Config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.duybao.SplitGo.Enum.Role;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.UserRepository;

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
    ApplicationRunner applicationRunner(UserRepository userRepository) {

        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {

                User user = User.builder()
                        .username("admin")
                        .email("admin@admin.com")
                        .password(passwordEncoder.encode("admin"))
                        .role(Role.ROLE_ADMIN)
                        .build();
                userRepository.save(user);
            }
            if (userRepository.findByUsername("user").isEmpty()) {

                User user = User.builder()
                        .username("user")
                        .email("user@user.com")
                        .password(passwordEncoder.encode("user"))
                        .role(Role.ROLE_USER)
                        .build();
                userRepository.save(user);
            }
            if (userRepository.findByUsername("seller").isEmpty()) {

                User user = User.builder()
                        .username("seller")
                        .email("seller@seller.com")
                        .password(passwordEncoder.encode("seller"))
                        .role(Role.ROLE_SELLER)
                        .build();
                userRepository.save(user);
            }
        };
    }
}
