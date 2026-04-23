package com.duybao.SplitGo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan("com.duybao.SplitGo.Model")
public class SplitGoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SplitGoApplication.class, args);
    }
}
