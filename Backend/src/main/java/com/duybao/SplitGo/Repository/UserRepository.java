package com.duybao.SplitGo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duybao.SplitGo.Model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String Username);

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmail(String Email);
}
