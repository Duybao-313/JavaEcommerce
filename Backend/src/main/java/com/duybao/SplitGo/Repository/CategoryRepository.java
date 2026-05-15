package com.duybao.SplitGo.Repository;

import com.duybao.SplitGo.Model.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);

    List<Category> findByParentIsNull();

    List<Category> findByParentId(Long parentId);
}

