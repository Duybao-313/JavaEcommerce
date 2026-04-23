package com.duybao.SplitGo.Validator;

import java.text.Normalizer;

import org.springframework.stereotype.Component;

@Component
public class StringNormalize {
    public String normalize(String input) {
        if (input == null) return null;
        String trimmed = input.trim();
        // chuyển về lowercase
        String lower = trimmed.toLowerCase();
        // loại bỏ dấu tiếng Việt
        String normalized =
                Normalizer.normalize(lower, Normalizer.Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        // loại ký tự không cho phép, giữ chữ, số, underscore, dash
        return normalized.replaceAll("[^a-z0-9_\\-]", "");
    }
}
