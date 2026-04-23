package com.duybao.SplitGo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duybao.SplitGo.Model.InvalidatedToken;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {}
